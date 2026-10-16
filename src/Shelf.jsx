import { useLayoutEffect, useRef, useState } from "react";
import { gameStatuses, planShelf } from "./library.js";
import Controller from "./Controller.jsx";
import headsetImage from "./assets/v3-headset-blackshark.webp";
import plushImage from "./assets/v4-sonic-plush.webp";
import beamImage from "./assets/v2-beam.webp";
import { getSleeve } from "./sleeves.js";

function GameCase({ game, onSelect }) {
  const sleeve = getSleeve(game.sleeve);
  const spineTitle = game.spineTitle || game.title;
  // Finished is the norm, so only the exceptions get a sticker.
  const hasSticker = game.status === "playing" || game.status === "dropped";
  const caseLabel = hasSticker
    ? game.title + ", " + gameStatuses[game.status].toLowerCase()
    : game.title;
  return (
    <button
      className="game-case"
      onClick={() => onSelect(game)}
      aria-label={"Open " + caseLabel}
      aria-haspopup="dialog"
      title={caseLabel}
      style={{ "--spine-ink": sleeve.ink }}
    >
      <img
        className="case-shell"
        src={sleeve.image}
        alt=""
        aria-hidden="true"
      />
      {hasSticker && (
        <span
          className={"spine-sticker spine-sticker--" + game.status}
          aria-hidden="true"
        />
      )}
      <span className="spine-platform" aria-hidden="true">
        PC
      </span>
      <span
        className={
          "spine-title" + (spineTitle.length > 24 ? " spine-title--long" : "")
        }
      >
        {spineTitle}
      </span>
    </button>
  );
}

function Plush() {
  return (
    <img
      className="plush"
      src={plushImage}
      alt=""
      aria-hidden="true"
      decoding="async"
    />
  );
}

function GameCubby({ games, isWide = false, hasPlush = false, onSelect }) {
  return (
    <div className={"cubby game-cubby" + (isWide ? " wide-cubby" : "")}>
      {games.length || hasPlush ? (
        <div className="cases">
          {games.map((game) => (
            <GameCase key={game.id} game={game} onSelect={onSelect} />
          ))}
          {hasPlush && (
            <div className="plush-rest">
              <Plush />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ControllerCubby() {
  return (
    <div className="cubby controller-cubby">
      <div className="controller-rest">
        <Controller />
      </div>
    </div>
  );
}

function HeadsetCubby() {
  return (
    <div className="cubby headset-cubby">
      <div className="headset-rest">
        <img
          className="headset"
          src={headsetImage}
          alt="Illustrated black BlackShark V3 inspired headset on a stand"
          decoding="async"
        />
      </div>
    </div>
  );
}

function PlushCubby() {
  return (
    <div className="cubby plush-cubby">
      <div className="plush-cubby-rest">
        <Plush />
      </div>
    </div>
  );
}

function Beam() {
  return (
    <div className="shelf-ledge" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function readMeasures(shelfElement) {
  const shelfStyle = getComputedStyle(shelfElement);
  const readPixels = (name) => parseFloat(shelfStyle.getPropertyValue(name));
  return {
    containerWidth: shelfElement.clientWidth,
    caseWidth: readPixels("--case-width"),
    caseGap: readPixels("--case-gap"),
    casePadding: readPixels("--case-padding"),
    plushWidth: readPixels("--plush-width"),
  };
}

export default function Shelf({ games, onSelect, emptyContent }) {
  const container = useRef(null);
  const [measures, setMeasures] = useState(null);
  // Measure before the first paint so desktop never flashes the phone layout.
  useLayoutEffect(() => {
    setMeasures(readMeasures(container.current));
    const observer = new ResizeObserver(() =>
      setMeasures(readMeasures(container.current)),
    );
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  const plan = measures
    ? planShelf({ gameCount: games.length, ...measures })
    : { layout: "narrow", rows: [] };

  function renderCubby(cubby, key) {
    if (cubby.type === "controller") return <ControllerCubby key={key} />;
    if (cubby.type === "headset") return <HeadsetCubby key={key} />;
    if (cubby.type === "plush") return <PlushCubby key={key} />;
    return (
      <GameCubby
        key={key}
        games={games.slice(cubby.start, cubby.end)}
        isWide={cubby.isWide}
        hasPlush={cubby.hasPlush}
        onSelect={onSelect}
      />
    );
  }

  return (
    <div
      className={
        "shelves " + (plan.layout === "wide" ? "wide-layout" : "narrow-layout")
      }
      ref={container}
      aria-label="Game collection"
      style={{ "--shelf-image": 'url("' + beamImage + '")' }}
    >
      {games.length === 0 && emptyContent}
      {plan.rows.map((row, rowIndex) => (
        <div className="shelf-row" key={rowIndex}>
          {row.type === "band" ? (
            <div
              className={
                "shelf-band " +
                (row.cubbies.length === 2 && !row.cubbies[0].isWide
                  ? "two-cubbies"
                  : "three-cubbies")
              }
            >
              {row.cubbies.map((cubby, cubbyIndex) =>
                renderCubby(cubby, cubbyIndex),
              )}
            </div>
          ) : (
            renderCubby(row, "single")
          )}
          <Beam />
        </div>
      ))}
    </div>
  );
}
