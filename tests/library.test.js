import test from 'node:test';
import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import { selectGames, planShelf, shareSlots, getGenres, getYears, gameStatuses, formatPlayedDate, formatHours } from '../src/library.js';
import { games, profile } from '../src/data/games.js';
import { sleeveColors } from '../src/sleeveColors.js';

test('filters intersect and search ignores surrounding spaces and case', () => {
  const entries = [
    { id: 'a', title: 'Moon', years: [2026], genres: ['Puzzle', 'Adventure'], lastPlayed: null },
    { id: 'b', title: 'Moon Two', years: [2027], genres: ['Puzzle'], lastPlayed: null },
    { id: 'c', title: 'Moon Three', years: [2026], genres: ['Action'], lastPlayed: null },
  ];
  assert.deepEqual(selectGames(entries, { year: '2026', genre: 'Puzzle', query: ' MOON ' }).map(game => game.id), ['a']);
});

test('recent order puts unknown dates last and breaks ties by title without mutating data', () => {
  const entries = [
    { title: 'Unknown', years: [2026], genres: [], lastPlayed: null },
    { title: 'Zebra', years: [2026], genres: [], lastPlayed: { date: '2026-09-01' } },
    { title: 'Alpha', years: [2026], genres: [], lastPlayed: { date: '2026-09-01' } },
    { title: 'Earlier', years: [2026], genres: [], lastPlayed: { date: '2026-01-01' } },
  ];
  assert.deepEqual(selectGames(entries, { year: 2026 }).map(game => game.title), ['Alpha', 'Zebra', 'Earlier', 'Unknown']);
  assert.equal(entries[0].title, 'Unknown');
  assert.deepEqual(selectGames(entries, { year: 2026, sort: 'title' }).map(game => game.title), ['Alpha', 'Earlier', 'Unknown', 'Zebra']);
});

test('a game played across years appears on each of those shelves, and no shelf predates the start year', () => {
  const entries = [
    { id: 'returning', title: 'Returning', years: [2026, 2027], genres: [], lastPlayed: null },
    { id: 'new', title: 'New', years: [2027], genres: [], lastPlayed: null },
  ];
  assert.deepEqual(selectGames(entries, { year: 2026 }).map(game => game.id), ['returning']);
  assert.deepEqual(selectGames(entries, { year: 2027 }).map(game => game.id), ['new', 'returning']);
  assert.deepEqual(getYears(entries, 2026), [2027, 2026]);
  assert.deepEqual(getYears([{ years: [2025, 2026] }], 2026), [2026]);
});

test('genre counts can overlap, but the filter options remain unique', () => {
  assert.deepEqual(getGenres([{ genres: ['Puzzle', 'Adventure'] }, { genres: ['Puzzle'] }]), ['Adventure', 'Puzzle']);
});

const desktop = { containerWidth: 1030, caseWidth: 56, caseGap: 10, casePadding: 18, plushWidth: 232 };
const tablet = { ...desktop, containerWidth: 600 };
const phone = { containerWidth: 331, caseWidth: 56, caseGap: 5, casePadding: 12, plushWidth: 232 };

// Flattens a plan into its game shelves, in reading order.
const gameShelves = plan => plan.rows.flatMap(row => row.type === 'band' ? row.cubbies : [row]).filter(cubby => cubby.type === 'games');
const sizes = plan => gameShelves(plan).map(shelf => shelf.end - shelf.start);

test('slots are shared by capacity with the remainder going to earlier shelves', () => {
  assert.deepEqual(shareSlots(26, [8, 8, 8, 8]), [7, 7, 6, 6]);
  assert.deepEqual(shareSlots(20, [9, 15]), [8, 12]);
});

test('every layout keeps every game once and in order, with one controller and headset', () => {
  for (const measures of [desktop, tablet, phone]) {
    for (let gameCount = 0; gameCount <= 60; gameCount++) {
      const plan = planShelf({ gameCount, ...measures });
      const shelves = gameShelves(plan);
      let nextIndex = 0;
      for (const shelf of shelves) {
        assert.equal(shelf.start, nextIndex);
        nextIndex = shelf.end;
      }
      assert.equal(nextIndex, gameCount);
      const accessories = plan.rows.flatMap(row => row.type === 'band' ? row.cubbies : [row]).map(cubby => cubby.type);
      assert.equal(accessories.filter(type => type === 'controller').length, 1);
      assert.equal(accessories.filter(type => type === 'headset').length, 1);
    }
  }
});

test('the plush sits once, after the last games, with room reserved for it', () => {
  for (const measures of [desktop, tablet]) {
    for (let gameCount = 1; gameCount <= 60; gameCount++) {
      const shelves = gameShelves(planShelf({ gameCount, ...measures }));
      const withPlush = shelves.filter(shelf => shelf.hasPlush);
      assert.equal(withPlush.length, 1);
      assert.equal(withPlush[0], shelves.at(-1));
    }
  }
  for (let gameCount = 1; gameCount <= 60; gameCount++) {
    const plan = planShelf({ gameCount, ...phone });
    assert.equal(plan.rows.at(-1).type, 'plush');
  }
  assert.equal(planShelf({ gameCount: 0, ...desktop }).rows.some(row => row.type === 'plush'), false);
});

test('desktop shares the free space between the shelf beside the headset and the shelf below', () => {
  // Today's collection: 3 + 3 on top, then 8 beside the headset and 8 plus Sonic below.
  assert.deepEqual(sizes(planShelf({ gameCount: 22, ...desktop })), [3, 3, 8, 8]);
});

test('phone rows stay even, with fuller rows first and no zig-zag', () => {
  assert.deepEqual(sizes(planShelf({ gameCount: 22, ...phone })), [5, 5, 4, 4, 4]);
  for (let gameCount = 1; gameCount <= 60; gameCount++) {
    const rowSizes = sizes(planShelf({ gameCount, ...phone }));
    assert.ok(rowSizes.every(size => size >= 1 && size <= 5));
    assert.ok(Math.max(...rowSizes) - Math.min(...rowSizes) <= 1);
    assert.ok(rowSizes.every((size, index) => index === 0 || size <= rowSizes[index - 1]));
  }
});

test('unknown and zero hours differ; month dates never claim an exact day', () => {
  assert.equal(formatHours(null), 'Not recorded');
  assert.equal(formatHours(0), '0 h');
  assert.equal(formatHours(3.5), '3.5 h');
  assert.equal(formatPlayedDate(null), 'Not recorded');
  assert.equal(formatPlayedDate({ date: '2026-09-01', precision: 'month' }), 'September 2026');
  assert.equal(formatPlayedDate({ date: '2026-09-28', precision: 'day' }), '28 September 2026');
});

test('manually edited data has unique ids, valid dates and no invented defaults', () => {
  assert.equal(new Set(games.map(game => game.id)).size, games.length);
  for (const game of games) {
    assert.ok(game.id && game.title);
    assert.ok(Array.isArray(game.years) && game.years.length > 0);
    assert.equal(new Set(game.years).size, game.years.length);
    assert.ok(game.years.every(year => Number.isInteger(year) && year >= profile.startYear));
    assert.ok(game.sleeve in sleeveColors, game.id + ' has an unknown sleeve: ' + game.sleeve);
    assert.ok(game.status === null || game.status in gameStatuses, game.id + ' has an unknown status: ' + game.status);
    for (const removedField of ['year', 'color', 'ink']) assert.ok(!(removedField in game), game.id + ' still has ' + removedField);
    assert.ok(Array.isArray(game.genres));
    assert.ok(Array.isArray(game.notes));
    assert.ok(game.totalHours === null || (Number.isFinite(game.totalHours) && game.totalHours >= 0));
    assert.ok(game.steamAppId === null || (Number.isInteger(game.steamAppId) && game.steamAppId > 0));
    const dates = [...game.notes.map(note => note.date), ...(game.lastPlayed ? [game.lastPlayed.date] : [])];
    for (const date of dates) {
      assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(new Date(date + 'T00:00:00Z').toISOString().slice(0, 10), date);
    }
    if (game.lastPlayed) assert.ok(['day', 'month'].includes(game.lastPlayed.precision));
    assert.ok(game.notes.every(note => typeof note.text === 'string' && note.text.trim().length > 0));
  }
});

test('every game has a saved cover; run npm run covers if this fails', () => {
  const missing = games.filter(game => !existsSync(new URL('../src/assets/covers/' + game.id + '.jpg', import.meta.url)));
  assert.deepEqual(missing.map(game => game.id), []);
});
