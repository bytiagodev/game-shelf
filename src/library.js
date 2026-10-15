export const gameStatuses = {
  playing: "Playing",
  finished: "Finished",
  dropped: "Dropped",
};

// A game sits on the shelf of every year it was played, newest year first.
// The journal starts at startYear, so earlier years never get a shelf.
export function getYears(games, startYear) {
  return [...new Set([startYear, ...games.flatMap((game) => game.years)])]
    .filter((year) => year >= startYear)
    .sort((firstYear, secondYear) => secondYear - firstYear);
}

export function getGenres(games) {
  return [...new Set(games.flatMap((game) => game.genres))].sort();
}

export function selectGames(
  games,
  { year, genre = "all", query = "", sort = "recent" },
) {
  const search = query.trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
  return games
    .filter(
      (game) =>
        game.years.includes(Number(year)) &&
        (genre === "all" || game.genres.includes(genre)) &&
        (!search ||
          [game.title, game.spineTitle || ""].some((searchableTitle) =>
            searchableTitle
              .replace(/\s+/g, " ")
              .toLocaleLowerCase("en")
              .includes(search),
          )),
    )
    .sort((firstGame, secondGame) => {
      if (sort === "title")
        return firstGame.title.localeCompare(secondGame.title, "en");
      // A missing date goes last. Dates are manually recorded, never inferred from hours.
      return (
        (secondGame.lastPlayed?.date ?? "").localeCompare(
          firstGame.lastPlayed?.date ?? "",
        ) || firstGame.title.localeCompare(secondGame.title, "en")
      );
    });
}

export function groupCompactRows(games, capacity) {
  const maximumSize = Math.max(1, Math.floor(capacity) || 1);
  const smallerSize = Math.min(4, maximumSize);
  const rows = [];
  let remainingCount = games.length;
  let nextSize = maximumSize;
  // Fill from the bottom so spare space stays on the first shelf.
  while (remainingCount > maximumSize) {
    rows.unshift(games.slice(remainingCount - nextSize, remainingCount));
    remainingCount -= nextSize;
    nextSize = nextSize === maximumSize ? smallerSize : maximumSize;
  }
  if (remainingCount) rows.unshift(games.slice(0, remainingCount));
  return rows;
}

export function formatPlayedDate(value) {
  if (!value?.date) return "Not recorded";
  // Use UTC to avoid a date shifting on computers in another time zone.
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "long",
    ...(value.precision === "day" ? { day: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(value.date + "T00:00:00Z"));
}

export function formatHours(hours) {
  return hours == null
    ? "Not recorded"
    : new Intl.NumberFormat("en-GB", {
        maximumFractionDigits: 1,
      }).format(hours) + " h";
}
