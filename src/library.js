export function getGenres(games) {
  return [...new Set(games.flatMap(game => game.genres))].sort();
}

export function selectGames(games, { year, genre = 'all', query = '', sort = 'recent' }) {
  const search = query.trim().toLocaleLowerCase('en');
  return games.filter(game =>
    game.year === Number(year) &&
    (genre === 'all' || game.genres.includes(genre)) &&
    (!search || game.title.toLocaleLowerCase('en').includes(search)),
  ).sort((firstGame, secondGame) => {
    if (sort === 'title') return firstGame.title.localeCompare(secondGame.title, 'en');
    // A missing date goes last. Dates are manually recorded, never inferred from hours.
    return (secondGame.lastPlayed?.date ?? '').localeCompare(firstGame.lastPlayed?.date ?? '') ||
      firstGame.title.localeCompare(secondGame.title, 'en');
  });
}

export function groupRows(games, count) {
  const size = Math.max(1, Math.floor(count) || 1);
  return Array.from({ length: Math.ceil(games.length / size) },
    (unusedGame, rowIndex) => games.slice(rowIndex * size, (rowIndex + 1) * size));
}

export function formatPlayedDate(value) {
  if (!value?.date) return 'Not recorded';
  // Use UTC to avoid a date shifting on computers in another time zone.
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric', month: 'long',
    ...(value.precision === 'day' ? { day: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(new Date(value.date + 'T00:00:00Z'));
}

export function formatHours(hours) {
  return hours == null ? 'Not recorded' : new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 1,
  }).format(hours) + ' h';
}
