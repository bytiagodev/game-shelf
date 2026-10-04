import { useEffect, useRef, useState } from "react";
import Controller from "./Controller.jsx";
import headsetImage from "./assets/v2-headset.webp";
import beamImage from "./assets/v2-beam.webp";
import mint from "./assets/v3-spine-mint.webp";
import yellow from "./assets/v3-spine-yellow.webp";
import blue from "./assets/v3-spine-blue.webp";
import lavender from "./assets/v3-spine-lavender.webp";
import pink from "./assets/v3-spine-pink.webp";
import orange from "./assets/v3-spine-orange.webp";
import black from "./assets/v3-spine-black.webp";
import white from "./assets/v3-spine-white.webp";
import red from "./assets/v3-spine-red.webp";
import royalBlue from "./assets/v3-spine-royal-blue.webp";
import green from "./assets/v3-spine-green.webp";
import grey from "./assets/v3-spine-grey.webp";
import teal from "./assets/v3-spine-teal.webp";
import cream from "./assets/v3-spine-cream.webp";
import brown from "./assets/v3-spine-brown.webp";
import burgundy from "./assets/v3-spine-burgundy.webp";
import lime from "./assets/v3-spine-lime.webp";
import violet from "./assets/v3-spine-violet.webp";

const sleeves = [
  mint,
  yellow,
  blue,
  lavender,
  pink,
  orange,
  black,
  white,
  red,
  royalBlue,
  green,
  grey,
  teal,
  cream,
  brown,
  burgundy,
  lime,
  violet,
];
const palette = [
  "75e1c4",
  "ffcf64",
  "79c8f0",
  "aa8ef1",
  "ff8eab",
  "ff9961",
  "22232c",
  "f8f8f0",
  "d93640",
  "3b68d9",
  "2e8653",
  "8c99aa",
  "199caa",
  "e3d1a1",
  "966042",
  "892e4a",
  "afda4a",
  "7245bc",
];
const lightTitles = new Set([6, 8, 9, 10, 14, 15, 17]);
const hexToRgb = (hexColor) =>
  [0, 2, 4].map((offset) => parseInt(hexColor.slice(offset, offset + 2), 16));
function getGameSleeve(game) {
  const targetColor = /^#[0-9a-f]{6}$/i.test(game.color || "")
    ? hexToRgb(game.color.slice(1))
    : hexToRgb(palette[0]);
  const distances = palette.map((hexColor) =>
    hexToRgb(hexColor).reduce(
      (total, channel, index) => total + (channel - targetColor[index]) ** 2,
      0,
    ),
  );
  const index = distances.indexOf(Math.min(...distances));
  return {
    image: sleeves[index],
    ink: lightTitles.has(index) ? "#fffaf3" : "#191928",
  };
}

function GameCubby({ games, isWideLayout = false, onSelect }) {
  return (
    <div className={"cubby game-cubby" + (isWideLayout ? " wide-cubby" : "")}>
      {games.length ? (
        <div className="cases">
          {games.map((game) => {
            const sleeve = getGameSleeve(game);
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
                <span className="spine-title">{game.title}</span>
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

export default function Shelf({ games, onSelect, profile, emptyContent }) {
  const container = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setContainerWidth(entry.contentRect.width),
    );
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const isWideLayout = containerWidth >= 760;
  const isCompactLayout = containerWidth < 430;
  const fullCapacity = Math.max(1, Math.floor((containerWidth - 36 + 10) / 66));
  const smallCapacity = Math.max(
    1,
    Math.min(3, Math.floor(((containerWidth - 32) / 3 - 36 + 10) / 66)),
  );
  const lowerCapacity = Math.max(
    1,
    Math.floor((((containerWidth - 16) * 2) / 3 - 36 + 10) / 66),
  );
  const firstCount = isWideLayout ? smallCapacity * 2 : fullCapacity;
  const controller = (
    <div className="cubby controller-cubby">
      <div className="profile-label">
        {profile.steamUrl ? (
          <a
            href={profile.steamUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open Steam"
          >
            {profile.name}
          </a>
        ) : (
          <span>{profile.name}</span>
        )}
      </div>
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
          alt="Illustrated charcoal and lavender gaming headset on a stand"
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
  const tailRows = Array.from({ length: tailRowCount }, (unusedRow, index) => {
    const startIndex = index * tailSize + Math.min(index, extraCaseCount);
    return remainingGames.slice(
      startIndex,
      startIndex + tailSize + (index < extraCaseCount ? 1 : 0),
    );
  });

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
        <div className="shelf-row" key={index}>
          <GameCubby games={row} onSelect={onSelect} />
          <Beam />
        </div>
      ))}
      {!isWideLayout && isCompactLayout && (
        <div className="shelf-row">
          {headset}
          <Beam />
        </div>
      )}
    </div>
  );
}
