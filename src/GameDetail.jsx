import { useEffect, useRef, useState } from "react";
import { formatHours, formatPlayedDate, gameStatuses } from "./library.js";
import { getSleeve } from "./sleeves.js";
import { getCover } from "./covers.js";

function Cover({ game }) {
  const [coverFailed, setCoverFailed] = useState(false);
  const sleeve = getSleeve(game.sleeve);
  const cover = getCover(game.id);
  return (
    <div
      className="cover"
      style={{
        "--case-color": sleeve.color,
        "--case-ink": sleeve.ink,
      }}
    >
      {cover && !coverFailed ? (
        <img
          src={cover}
          alt={game.title + " game cover"}
          onError={() => setCoverFailed(true)}
        />
      ) : (
        <>
          <span className="cover-platform">PC GAME</span>
          <span className="cover-motif" aria-hidden="true" />
          <strong>{game.title}</strong>
          <span className="cover-caption">
            {cover ? "Cover unavailable" : "Cover not added yet"}
          </span>
        </>
      )}
    </div>
  );
}

export default function GameDetail({ game, onDismiss }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (game && !dialog.current.open) dialog.current.showModal();
  }, [game]);

  const close = () => dialog.current.close();
  function closeOnBackdrop(event) {
    if (event.target !== dialog.current) return;
    const dialogBounds = dialog.current.getBoundingClientRect();
    if (
      event.clientX < dialogBounds.left ||
      event.clientX > dialogBounds.right ||
      event.clientY < dialogBounds.top ||
      event.clientY > dialogBounds.bottom
    )
      close();
  }

  return (
    <dialog
      className="game-dialog"
      ref={dialog}
      aria-labelledby="game-title"
      onClose={onDismiss}
      onClick={closeOnBackdrop}
    >
      {game && (
        <>
          <button
            className="close-button"
            onClick={close}
            autoFocus
            aria-label="Close game details"
          >
            ×
          </button>
          <div className="detail-layout">
            <div className="detail-cover">
              <Cover key={game.id} game={game} />
              {game.steamAppId && (
                <a
                  className="steam-link"
                  href={
                    "https://store.steampowered.com/app/" +
                    game.steamAppId +
                    "/"
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Steam
                </a>
              )}
            </div>
            <div className="detail-content">
              <h2 id="game-title">{game.title}</h2>
              {game.steamCollection && (
                <p className="collection-label">From {game.steamCollection}</p>
              )}
              <div className="tags">
                {game.genres.map((genre) => (
                  <span key={genre}>{genre}</span>
                ))}
              </div>
              <dl className="game-facts">
                {game.status && (
                  <div>
                    <dt>Status</dt>
                    <dd>{gameStatuses[game.status]}</dd>
                  </div>
                )}
                <div>
                  <dt>Steam hours (lifetime)</dt>
                  <dd>{formatHours(game.totalHours)}</dd>
                </div>
                <div>
                  <dt>
                    Last played
                    {game.lastPlayed?.precision === "month" && " (approx.)"}
                  </dt>
                  <dd>{formatPlayedDate(game.lastPlayed)}</dd>
                </div>
              </dl>
              <div className="notes">
                <h3>Notes</h3>
                {game.notes.length ? (
                  [...game.notes]
                    .sort((firstNote, secondNote) =>
                      firstNote.date.localeCompare(secondNote.date),
                    )
                    .map((note, index) => (
                      <article className="note" key={note.date + "-" + index}>
                        <time dateTime={note.date}>
                          {formatPlayedDate({
                            date: note.date,
                            precision: "day",
                          })}
                        </time>
                        <p>{note.text}</p>
                      </article>
                    ))
                ) : (
                  <p className="empty-note">No notes yet.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}
