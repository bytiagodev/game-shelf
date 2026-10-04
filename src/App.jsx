import { useMemo, useState } from 'react';
import { games, profile } from './data/games.js';
import { sampleGames } from './data/sampleGames.js';
import { getGenres, selectGames } from './library.js';
import Shelf from './Shelf.jsx';
import GameDetail from './GameDetail.jsx';

const isSample = games.length === 0;
const collection = isSample ? sampleGames : games;
const years = [...new Set([profile.startYear, ...collection.map(game => game.year)])].sort((firstYear, secondYear) => secondYear - firstYear);

export default function App() {
  const [year, setYear] = useState(years[0]);
  const [genre, setGenre] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [selectedGame, setSelectedGame] = useState(null);

  const yearGames = useMemo(() => collection.filter(game => game.year === Number(year)), [year]);
  const genres = getGenres(yearGames);
  const visibleGames = selectGames(collection, { year, genre, query, sort });

  function resetFilters() { setGenre('all'); setQuery(''); }

  return (
    <div className="app">
      <a className="skip-link" href="#collection">Skip to the shelf</a>
      <div className="cabinet">
      <header className="site-header">
        <div className="header-copy">
        <a className="brand" href="./" aria-label="Game Shelf home">
          <h1><span>Game</span> <span>Shelf</span></h1>
        </a>
        <p className="shelf-status" role="status">{visibleGames.length === yearGames.length
          ? yearGames.length
          : visibleGames.length + ' of ' + yearGames.length}{isSample ? (yearGames.length === 1 ? ' fictional sample' : ' fictional samples')
          : (yearGames.length === 1 ? ' game' : ' games')}</p>
        </div>
      </header>

      <main>
        <section id="collection" className="collection" aria-labelledby="shelf-heading">
          <h2 id="shelf-heading" className="sr-only">Games</h2>

          <div className="toolbar">
            <label className="year-control"><span className="sr-only">Collection year</span>
              <select value={year} onChange={event => { setYear(Number(event.target.value)); resetFilters(); }}>
                {years.map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="search-field">
              <span className="sr-only">Search games</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a game" /></label>
            <label className="select-field"><span className="sr-only">Genre</span><select value={genre} onChange={event => setGenre(event.target.value)}>
              <option value="all">All genres</option>{genres.map(value => <option key={value}>{value}</option>)}
            </select></label>
            <label className="select-field"><span className="sr-only">Sort</span><select value={sort} onChange={event => setSort(event.target.value)}>
              <option value="recent">Last played</option><option value="title">Title A–Z</option>
            </select></label>
            {(genre !== 'all' || query) && <button className="text-button" onClick={resetFilters}>Clear</button>}
          </div>

          <div className="shelf-room">
          <Shelf games={visibleGames} onSelect={setSelectedGame} profile={profile}
            emptyContent={<div className="empty-shelf"><h3>No games here yet.</h3>
              {yearGames.length > 0 && <button className="secondary-button" onClick={resetFilters}>Show all games</button>}
            </div>} />
          </div>
        </section>

      </main>
      </div>
        {genres.length > 0 && <details className="year-summary">
          <summary>By genre</summary>
          <div className="genre-summary">{genres.map(value => {
            const count = yearGames.filter(game => game.genres.includes(value)).length;
            return <div className="genre-stat" key={value}><div><span>{value}</span><span>{count}</span></div>
              <div className="genre-track"><span style={{ width: count / yearGames.length * 100 + '%' }} /></div></div>;
          })}</div>
        </details>}

      <GameDetail game={selectedGame} isSample={isSample} onDismiss={() => setSelectedGame(null)} />
    </div>
  );
}
