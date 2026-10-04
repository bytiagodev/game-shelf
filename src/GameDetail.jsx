import { useEffect, useRef, useState } from 'react';
import { formatHours, formatPlayedDate } from './library.js';

function Cover({ game }) {
  const [coverFailed, setCoverFailed] = useState(false);
  return (
    <div className={'cover cover--' + (game.motif || 'orbit')}
      style={{ '--case-color': game.color || '#aac3b6', '--case-ink': game.ink || '#253c32' }}>
      {game.coverUrl && !coverFailed
        ? <img src={game.coverUrl} alt={game.title + ' game cover'} onError={() => setCoverFailed(true)} />
        : <><span className="cover-platform">PC GAME</span>
          <span className="cover-motif" aria-hidden="true" />
          <strong>{game.title}</strong>
          <span className="cover-caption">{game.coverUrl ? 'Cover unavailable' : 'Cover not added yet'}</span></>}
    </div>
  );
}

export default function GameDetail({ game, isSample, onDismiss }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (game && !dialog.current.open) dialog.current.showModal();
  }, [game]);

  const close = () => dialog.current.close();
  function keepTabInDialog(event) {
    if (event.key !== 'Tab') return;
    const controls = [...event.currentTarget.querySelectorAll('button, a[href]')];
    const firstControl = controls[0];
    const lastControl = controls.at(-1);
    if (event.shiftKey && document.activeElement === firstControl) {
      event.preventDefault();
      lastControl.focus();
    } else if (!event.shiftKey && document.activeElement === lastControl) {
      event.preventDefault();
      firstControl.focus();
    }
  }
  function closeOnBackdrop(event) {
    if (event.target !== dialog.current) return;
    const dialogBounds = dialog.current.getBoundingClientRect();
    if (event.clientX < dialogBounds.left || event.clientX > dialogBounds.right ||
        event.clientY < dialogBounds.top || event.clientY > dialogBounds.bottom) close();
  }

  return (
    <dialog className="game-dialog" ref={dialog} aria-labelledby="game-title"
      onClose={onDismiss} onClick={closeOnBackdrop} onKeyDown={keepTabInDialog}>
      {game && <>
        <button className="close-button" onClick={close} autoFocus aria-label="Close game details">×</button>
        <div className="detail-layout">
          <div className="detail-cover">
            <Cover key={game.id} game={game} />
            {game.steamAppId && <a className="steam-link"
              href={'https://store.steampowered.com/app/' + game.steamAppId + '/'}
              target="_blank" rel="noreferrer">View on Steam <span aria-hidden="true">↗</span></a>}
          </div>
          <div className="detail-content">
            {isSample && <p className="sample-label">Fictional sample</p>}
            <h2 id="game-title">{game.title}</h2>
            <div className="tags">{game.genres.map(genre => <span key={genre}>{genre}</span>)}</div>
            <dl className="game-facts">
              <div><dt>Steam hours (lifetime)</dt><dd>{formatHours(game.totalHours)}</dd></div>
              <div><dt>Last played{game.lastPlayed?.precision === 'month' && ' (approx.)'}</dt><dd>{formatPlayedDate(game.lastPlayed)}</dd></div>
            </dl>
            <div className="notes">
              <h3>Notes</h3>
              {game.notes.length ? [...game.notes].sort((firstNote, secondNote) => secondNote.date.localeCompare(firstNote.date)).map((note, index) =>
                <article className="note" key={note.date + '-' + index}>
                  <time dateTime={note.date}>{formatPlayedDate({ date: note.date, precision: 'day' })}</time>
                  <p>{note.text}</p>
                </article>)
                : <p className="empty-note">No notes yet.</p>}
            </div>
          </div>
        </div>
      </>}
    </dialog>
  );
}
