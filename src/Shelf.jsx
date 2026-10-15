import { Fragment, useEffect, useRef, useState } from "react";
import { groupCompactRows } from "./library.js";
import Controller from "./Controller.jsx";
import headsetImage from "./assets/v3-headset-blackshark.webp";
import beamImage from "./assets/v2-beam.webp";
import { getSleeve } from "./sleeves.js";

function GameCubby({ games, isWideLayout = false, onSelect }) {
  return (
    <div className={"cubby game-cubby" + (isWideLayout ? " wide-cubby" : "")}>
      {games.length ? (
        <div className="cases">
          {games.map((game) => {
            const sleeve = getSleeve(game.sleeve);
            const spineTitle = game.spineTitle || game.title;
            return (
              <button
                className="game-case"
                key={game.id}
                onClick={() => onSelect(game)}
                aria-label={"Open " + game.title}
                aria-haspopup="dialog"
                title={game.title}
                style={{ "--spine-ink": sleeve.ink }}
              >
                <img
                  className="case-shell"
                  src={sleeve.image}
                  alt=""
                  aria-hidden="true"
                />
                <span className="spine-platform" aria-hidden="true">
                  PC
                </span>
                <span
                  className={
                    "spine-title" +
                    (spineTitle.length > 24 ? " spine-title--long" : "")
                  }
                >
                  {spineTitle}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
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

export default function Shelf({ games, onSelect, emptyContent }) {
  const container = useRef(null);
  const [layout, setLayout] = useState({
    containerWidth: 0,
    caseWidth: 56,
    caseGap: 10,
    casePadding: 18,
  });
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const shelfStyle = getComputedStyle(container.current);
      setLayout({
        containerWidth: entry.contentRect.width,
        caseWidth: parseFloat(shelfStyle.getPropertyValue("--case-width")),
        caseGap: parseFloat(shelfStyle.getPropertyValue("--case-gap")),
        casePadding: parseFloat(shelfStyle.getPropertyValue("--case-padding")),
      });
    });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const { containerWidth, caseWidth, caseGap, casePadding } = layout;
  const isWideLayout = containerWidth >= 760;
  const isCompactLayout = containerWidth < 430;
  const availableCapacity = Math.max(
    1,
    Math.floor(
      (containerWidth - casePadding * 2 + caseGap) / (caseWidth + caseGap),
    ),
  );
  const fullCapacity = isCompactLayout
    ? Math.min(5, availableCapacity)
    : availableCapacity;
  const smallCapacity = Math.max(
    1,
    Math.min(
      3,
      Math.floor(
        ((containerWidth - 32) / 3 - casePadding * 2 + caseGap) /
          (caseWidth + caseGap),
      ),
    ),
  );
  const lowerCapacity = Math.max(
    1,
    Math.floor(
      (((containerWidth - 16) * 2) / 3 - casePadding * 2 + caseGap) /
        (caseWidth + caseGap),
    ),
  );
  const compactRows = isCompactLayout ? groupCompactRows(games, fullCapacity) : [];
  const firstCount = isWideLayout
    ? smallCapacity * 2
    : isCompactLayout
      ? compactRows[0]?.length || 0
      : fullCapacity;
  const controller = (
    <div className="cubby controller-cubby">
      <div className="controller-rest">
        <Controller />
      </div>
    </div>
  );
  const headset = (
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
  const remainingGames = isWideLayout
    ? games.slice(firstCount + lowerCapacity)
    : games.slice(firstCount);
  const tailRowCount = Math.ceil(remainingGames.length / fullCapacity);
  const tailSize = Math.floor(remainingGames.length / (tailRowCount || 1));
  const extraCaseCount = remainingGames.length % (tailRowCount || 1);
  const tailRows = isCompactLayout
    ? compactRows.slice(1)
    : Array.from({ length: tailRowCount }, (unusedRow, index) => {
        const startIndex = index * tailSize + Math.min(index, extraCaseCount);
        return remainingGames.slice(
          startIndex,
          startIndex + tailSize + (index < extraCaseCount ? 1 : 0),
        );
      });
  const headsetAfterRow = Math.min(2, tailRows.length);

  if (games.length === 0)
    return (
      <div
        className="shelves narrow-layout"
        ref={container}
        aria-label="Game collection"
        style={{ "--shelf-image": 'url("' + beamImage + '")' }}
      >
        {emptyContent}
        {isCompactLayout ? (
          <>
            <div className="shelf-row">
              {controller}
              <Beam />
            </div>
            <div className="shelf-row">
              {headset}
              <Beam />
            </div>
          </>
        ) : (
          <div className="shelf-row">
            <div className="shelf-band two-cubbies">
              {controller}
              {headset}
            </div>
            <Beam />
          </div>
        )}
      </div>
    );

  return (
    <div
      className={"shelves " + (isWideLayout ? "wide-layout" : "narrow-layout")}
      ref={container}
      aria-label="Game collection"
      style={{ "--shelf-image": 'url("' + beamImage + '")' }}
    >
      {isWideLayout ? (
        <>
          <div className="shelf-row">
            <div className="shelf-band three-cubbies">
              <GameCubby
                games={games.slice(0, smallCapacity)}
                onSelect={onSelect}
              />
              {controller}
              <GameCubby
                games={games.slice(smallCapacity, firstCount)}
                onSelect={onSelect}
              />
            </div>
            <Beam />
          </div>
          <div className="shelf-row">
            <div className="shelf-band three-cubbies">
              <GameCubby
                isWideLayout
                games={games.slice(firstCount, firstCount + lowerCapacity)}
                onSelect={onSelect}
              />
              {headset}
            </div>
            <Beam />
          </div>
        </>
      ) : (
        <>
          {games.length > 0 && (
            <div className="shelf-row">
              <GameCubby
                games={games.slice(0, firstCount)}
                onSelect={onSelect}
              />
              <Beam />
            </div>
          )}
          {isCompactLayout ? (
            <div className="shelf-row">
              {controller}
              <Beam />
            </div>
          ) : (
            <div className="shelf-row">
              <div className="shelf-band two-cubbies">
                {controller}
                {headset}
              </div>
              <Beam />
            </div>
          )}
        </>
      )}
      {tailRows.map((row, index) => (
        <Fragment key={index}>
          <div className="shelf-row">
            <GameCubby games={row} onSelect={onSelect} />
            <Beam />
          </div>
          {isCompactLayout && index + 1 === headsetAfterRow && (
            <div className="shelf-row">
              {headset}
              <Beam />
            </div>
          )}
        </Fragment>
      ))}
      {isCompactLayout && tailRows.length === 0 && (
        <div className="shelf-row">
          {headset}
          <Beam />
        </div>
      )}
    </div>
  );
}
