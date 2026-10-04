import test from 'node:test';
import assert from 'node:assert/strict';
import { selectGames, groupRows, getGenres, formatPlayedDate, formatHours } from '../src/library.js';
import { games } from '../src/data/games.js';
import { sampleGames } from '../src/data/sampleGames.js';

test('filters intersect and search ignores surrounding spaces and case', () => {
  const entries = [
    { id: 'a', title: 'Moon', year: 2026, genres: ['Puzzle', 'Adventure'], lastPlayed: null },
    { id: 'b', title: 'Moon Two', year: 2025, genres: ['Puzzle'], lastPlayed: null },
    { id: 'c', title: 'Moon Three', year: 2026, genres: ['Action'], lastPlayed: null },
  ];
  assert.deepEqual(selectGames(entries, { year: '2026', genre: 'Puzzle', query: ' MOON ' }).map(game => game.id), ['a']);
});

test('recent order puts unknown dates last and breaks ties by title without mutating data', () => {
  const entries = [
    { title: 'Unknown', year: 2026, genres: [], lastPlayed: null },
    { title: 'Zebra', year: 2026, genres: [], lastPlayed: { date: '2026-09-01' } },
    { title: 'Alpha', year: 2026, genres: [], lastPlayed: { date: '2026-09-01' } },
    { title: 'Earlier', year: 2026, genres: [], lastPlayed: { date: '2026-01-01' } },
  ];
  assert.deepEqual(selectGames(entries, { year: 2026 }).map(game => game.title), ['Alpha', 'Zebra', 'Earlier', 'Unknown']);
  assert.equal(entries[0].title, 'Unknown');
  assert.deepEqual(selectGames(entries, { year: 2026, sort: 'title' }).map(game => game.title), ['Alpha', 'Earlier', 'Unknown', 'Zebra']);
});

test('rows preserve every case across narrow and wide layouts', () => {
  const entries = Array.from({ length: 17 }, (unusedValue, gameIndex) => gameIndex);
  for (const size of [1, 3, 5, 8]) {
    const rows = groupRows(entries, size);
    assert.deepEqual(rows.flat(), entries);
    assert.ok(rows.every(row => row.length <= size));
  }
});

test('genre counts can overlap, but the filter options remain unique', () => {
  assert.deepEqual(getGenres([{ genres: ['Puzzle', 'Adventure'] }, { genres: ['Puzzle'] }]), ['Adventure', 'Puzzle']);
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
  for (const collection of [games, sampleGames]) {
    assert.equal(new Set(collection.map(game => game.id)).size, collection.length);
    for (const game of collection) {
      assert.ok(game.id && game.title);
      assert.ok(Number.isInteger(game.year) && game.year >= 2026);
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
  }
});
