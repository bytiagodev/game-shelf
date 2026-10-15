import test from 'node:test';
import assert from 'node:assert/strict';
import { selectGames, groupCompactRows, getGenres, getYears, gameStatuses, formatPlayedDate, formatHours } from '../src/library.js';
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

test('compact shelves fill from the bottom and preserve game order as the collection grows', () => {
  const entries = Array.from({ length: 40 }, (unusedValue, gameIndex) => gameIndex);
  assert.deepEqual(groupCompactRows(entries.slice(0, 22), 5).map(row => row.length), [4, 4, 5, 4, 5]);
  assert.deepEqual(groupCompactRows(entries.slice(0, 23), 5).map(row => row.length), [5, 4, 5, 4, 5]);
  assert.deepEqual(groupCompactRows(entries.slice(0, 24), 5).map(row => row.length), [1, 5, 4, 5, 4, 5]);
  assert.deepEqual(groupCompactRows(entries.slice(0, 22), 4).map(row => row.length), [2, 4, 4, 4, 4, 4]);
  for (const capacity of [1, 3, 4, 5]) {
    for (let count = 0; count <= entries.length; count++) {
      const collection = entries.slice(0, count);
      const rows = groupCompactRows(collection, capacity);
      assert.deepEqual(rows.flat(), collection);
      assert.ok(rows.every(row => row.length > 0 && row.length <= capacity));
      assert.ok(rows.slice(1).every(row => row.length >= Math.min(4, capacity)));
    }
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
