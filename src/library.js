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

// Container widths where the cabinet switches layout.
export const shelfBreakpoints = { wide: 760, compact: 430 };

function countSlots(width, { caseWidth, caseGap, casePadding }) {
  return Math.max(
    1,
    Math.floor((width - casePadding * 2 + caseGap) / (caseWidth + caseGap)),
  );
}

// Shares slots between containers in proportion to their capacity, so the
// free space is spread out instead of piling up on one shelf. Any remainder
// goes to the earlier containers, keeping the fuller shelves first.
export function shareSlots(total, capacities) {
  const capacitySum = capacities.reduce((sum, capacity) => sum + capacity, 0);
  const shares = capacities.map((capacity) =>
    Math.floor((total * capacity) / capacitySum),
  );
  let leftover = total - shares.reduce((sum, share) => sum + share, 0);
  for (let index = 0; leftover > 0; index = (index + 1) % shares.length) {
    if (shares[index] < capacities[index]) {
      shares[index] += 1;
      leftover -= 1;
    }
  }
  return shares;
}

// Turns shares into consecutive game ranges.
function toRanges(counts, startIndex = 0) {
  let nextIndex = startIndex;
  return counts.map((count) => {
    const range = { start: nextIndex, end: nextIndex + count };
    nextIndex += count;
    return range;
  });
}

// Plans the cabinet for a container width. Rows hold game index ranges, so
// the plan can be tested without React. The plush bookend always sits after
// the last case on the last game shelf, except on phones where it gets its
// own shelf like the controller and headset.
export function planShelf({
  gameCount,
  containerWidth,
  caseWidth,
  caseGap,
  casePadding,
  plushWidth,
}) {
  const measures = { caseWidth, caseGap, casePadding };
  const isWide = containerWidth >= shelfBreakpoints.wide;
  const isCompact = containerWidth < shelfBreakpoints.compact;
  const plushSlots = Math.ceil((plushWidth + caseGap) / (caseWidth + caseGap));
  const fullCapacity = isCompact
    ? Math.min(5, countSlots(containerWidth, measures))
    : countSlots(containerWidth, measures);

  if (gameCount === 0) {
    return {
      layout: isCompact ? "compact" : "narrow",
      rows: isCompact
        ? [{ type: "controller" }, { type: "headset" }]
        : [
            {
              type: "band",
              cubbies: [{ type: "controller" }, { type: "headset" }],
            },
          ],
    };
  }

  if (isWide) {
    // Cubbies are separated by 16px gaps: three thirds on the top row and
    // two thirds beside the headset on the second.
    const smallCapacity = Math.min(
      3,
      countSlots((containerWidth - 32) / 3, measures),
    );
    const besideHeadsetCapacity = countSlots(
      ((containerWidth - 16) * 2) / 3,
      measures,
    );
    const topCount = Math.min(gameCount, smallCapacity * 2);
    const leftCount = Math.min(topCount, smallCapacity);
    // The shelf beside the headset and the shelves below share the rest,
    // with the plush counted as cases on the last shelf. With only a few
    // games, the plush sits beside the headset and no lower shelf is added.
    const occupied = gameCount - topCount + plushSlots;
    const lowerShelfCount = Math.max(
      0,
      Math.ceil((occupied - besideHeadsetCapacity) / fullCapacity),
    );
    const capacities = [
      besideHeadsetCapacity,
      ...Array(lowerShelfCount).fill(fullCapacity),
    ];
    const shares = moveSlotsToLast(
      shareSlots(occupied, capacities),
      plushSlots,
    );
    shares[shares.length - 1] -= plushSlots;
    const [besideHeadset, ...lowerShelves] = toRanges(shares, topCount);
    return {
      layout: "wide",
      rows: [
        {
          type: "band",
          cubbies: [
            { type: "games", start: 0, end: leftCount },
            { type: "controller" },
            { type: "games", start: leftCount, end: topCount },
          ],
        },
        {
          type: "band",
          cubbies: [
            {
              type: "games",
              ...besideHeadset,
              isWide: true,
              hasPlush: lowerShelfCount === 0,
            },
            { type: "headset" },
          ],
        },
        ...lowerShelves.map((range, index) => ({
          type: "games",
          ...range,
          hasPlush: index === lowerShelves.length - 1,
        })),
      ],
    };
  }

  if (isCompact) {
    // Even rows with the fuller ones first, then the plush on its own shelf.
    const rowCount = Math.ceil(gameCount / fullCapacity);
    const [firstRow, ...otherRows] = toRanges(
      shareSlots(gameCount, Array(rowCount).fill(fullCapacity)),
    ).map((range) => ({ type: "games", ...range }));
    const headsetAfter = Math.min(2, otherRows.length);
    return {
      layout: "compact",
      rows: [
        firstRow,
        { type: "controller" },
        ...otherRows.slice(0, headsetAfter),
        { type: "headset" },
        ...otherRows.slice(headsetAfter),
        { type: "plush" },
      ],
    };
  }

  // Narrow: every game shelf is full width, with the plush on the last one.
  const occupied = gameCount + plushSlots;
  const rowCount = Math.max(1, Math.ceil(occupied / fullCapacity));
  const shares = moveSlotsToLast(
    shareSlots(occupied, Array(rowCount).fill(fullCapacity)),
    plushSlots,
  );
  shares[shares.length - 1] -= plushSlots;
  const [firstRow, ...otherRows] = toRanges(shares).map((range, index) => ({
    type: "games",
    ...range,
    hasPlush: index === rowCount - 1,
  }));
  return {
    layout: "narrow",
    rows: [
      firstRow,
      { type: "band", cubbies: [{ type: "controller" }, { type: "headset" }] },
      ...otherRows,
    ],
  };
}

// Makes sure the last shelf has room for the plush, borrowing from the
// shelves just above it when there are only a few games.
function moveSlotsToLast(shares, neededSlots) {
  const lastIndex = shares.length - 1;
  for (let index = lastIndex - 1; index >= 0; index -= 1) {
    while (shares[lastIndex] < neededSlots && shares[index] > 0) {
      shares[index] -= 1;
      shares[lastIndex] += 1;
    }
  }
  return shares;
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
