import { useEffect, useMemo, useState } from "react";
import { games, profile } from "./data/games.js";
import {
  findGameByHash,
  getGenres,
  getYears,
  newestShelfYear,
  selectGames,
} from "./library.js";
import Shelf from "./Shelf.jsx";
import GameDetail from "./GameDetail.jsx";

const years = getYears(games, profile.startYear);
// A link that ends in #<game id> opens that game's case.
const linkedGame = findGameByHash(games, window.location.hash);

export default function App() {
  const [year, setYear] = useState(
    linkedGame ? newestShelfYear(linkedGame, years) : years[0],
  );
  const [genre, setGenre] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [selectedGame, setSelectedGame] = useState(linkedGame);

  useEffect(() => {
    function openLinkedGame() {
      const game = findGameByHash(games, window.location.hash);
      if (game) {
        setYear(newestShelfYear(game, years));
        setGenre("all");
        setQuery("");
      }
      setSelectedGame(game);
    }
    window.addEventListener("hashchange", openLinkedGame);
    return () => window.removeEventListener("hashchange", openLinkedGame);
  }, []);

  const yearGames = useMemo(
    () => games.filter((game) => game.years.includes(Number(year))),
    [year],
  );
  const genres = getGenres(yearGames);
  const visibleGames = selectGames(games, { year, genre, query, sort });

  function resetFilters() {
    setGenre("all");
    setQuery("");
  }

  // The address always names the open game, ready to be shared. replaceState
  // keeps the Back button for leaving the page, not for closing a case.
  function openGame(game) {
    history.replaceState(null, "", "#" + game.id);
    setSelectedGame(game);
  }

  function closeGame() {
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    setSelectedGame(null);
  }

  return (
    <div className="app">
      <a className="skip-link" href="#collection">
        Skip to the shelf
      </a>
      <div className="cabinet">
        <header className="site-header">
          <div className="header-copy">
            <a className="brand" href="./" aria-label="Game Shelf home">
              <h1>
                <span>Game</span> <span>Shelf</span>
              </h1>
            </a>
            <p className="shelf-status" role="status">
              {visibleGames.length === yearGames.length
                ? yearGames.length
                : visibleGames.length + " of " + yearGames.length}
              {yearGames.length === 1 ? " game" : " games"}
            </p>
          </div>
        </header>

        <main>
          <section
            id="collection"
            className="collection"
            aria-labelledby="shelf-heading"
          >
            <h2 id="shelf-heading" className="sr-only">
              Games
            </h2>

            <div className="toolbar">
              <label className="year-control">
                <span className="sr-only">Collection year</span>
                <select
                  value={year}
                  onChange={(event) => {
                    setYear(Number(event.target.value));
                    resetFilters();
                  }}
                >
                  {years.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="search-field">
                <span className="sr-only">Search games</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Find a game"
                />
              </label>
              <label className="select-field">
                <span className="sr-only">Genre</span>
                <select
                  value={genre}
                  onChange={(event) => setGenre(event.target.value)}
                >
                  <option value="all">All genres</option>
                  {genres.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="select-field">
                <span className="sr-only">Sort</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="recent">Last played</option>
                  <option value="title">Title A-Z</option>
                </select>
              </label>
              {(genre !== "all" || query) && (
                <button className="text-button" onClick={resetFilters}>
                  Clear
                </button>
              )}
            </div>

            <div className="shelf-room">
              <Shelf
                games={visibleGames}
                onSelect={openGame}
                emptyContent={
                  <div className="empty-shelf">
                    <h3>No games here yet.</h3>
                    {yearGames.length > 0 && (
                      <button
                        className="secondary-button"
                        onClick={resetFilters}
                      >
                        Show all games
                      </button>
                    )}
                  </div>
                }
              />
            </div>
          </section>
        </main>
      </div>
      <GameDetail game={selectedGame} onDismiss={closeGame} />
    </div>
  );
}
