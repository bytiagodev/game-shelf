# Adding a game

Edit `src/data/games.js`. Each game is one object.

```js
export const games = [
  {
    id: 'your-game',
    title: 'Your game',
    steamAppId: null,
    genres: ['Adventure'],
    years: [2026],
    lastPlayed: { date: '2026-09-01', precision: 'month' },
    status: 'playing',
    totalHours: null,
    sleeve: 'mint',
    notes: [
      { date: '2026-10-04', text: 'A thought to keep for later.' },
    ],
  },
];
```

- `id` is a unique, stable identifier.
- `years` lists every year the game was played, from 2026 onwards. When returning to a game in a new year, add that year instead of creating a second case; the game then appears on each of those shelves. Years before the collection's start year are never shown.
- `lastPlayed` can be `null`, an exact date with `precision: 'day'`, or an approximate month with `precision: 'month'`. For a month, use its first day for sorting; the interface displays only the month and year.
- `status` is `'playing'`, `'finished'`, `'dropped'` or `null` when not recorded.
- `totalHours` is the lifetime total copied from Steam. Use `null` if unknown; zero remains zero. It does not represent hours played that year.
- `steamAppId` enables the Steam store link.
- Covers come from Steam: run `npm run covers` after adding a game and it finds the portrait cover from `steamAppId`. For a game with no Steam page or the wrong art, add an optional `coverUrl` pointing at the image to use instead. The script saves any missing cover to `src/assets/covers/<id>.jpg`, and the site shows that local copy, so covers keep working even if Steam changes its links. `npm run covers -- --force` downloads them all again. A missing cover shows a title fallback, and the tests fail until every game has one.
- For a game I own through a Steam collection, use the collection's app ID and cover. The title can be the single game or the whole collection; when it's the single game, the optional `steamCollection` field names the collection in the details panel.
- `sleeve` names one of the 20 illustrated case colours: `mint`, `yellow`, `gold`, `orange`, `red`, `burgundy`, `pink`, `lavender`, `violet`, `blue`, `royal-blue`, `navy`, `teal`, `green`, `lime`, `cream`, `brown`, `grey`, `black` or `white`. Pick the one closest to the game's cover. The spine title colour and the fallback cover follow it.
- Optional `spineTitle` provides a shorter case label. Both names are searchable; the full `title` stays in game details and accessible labels.
- Use `\n` inside `spineTitle` to choose a line break, for example `"Prince of Persia:\nThe Lost Crown"`. Other labels wrap automatically when needed.
- Use `notes: []` when there are no notes. When I return to a game, I keep its one case: append a dated note, update `lastPlayed`, `totalHours` and `status`, and add the year to `years` if it is a new one.
- Games can have several genres; the genre filter lists every genre on the selected year's shelf.

The `profile` object in the same file sets the collection's starting year.

Historical dates may be approximate or unknown. Lifetime Steam hours cannot reconstruct yearly hours or session counts. New entries and notes can be more precise as I record them.
