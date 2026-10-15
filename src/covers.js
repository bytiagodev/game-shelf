// Covers live in src/assets/covers/<game id>.jpg. Run `npm run covers` to
// download any that are missing from each game's coverUrl.
const coverFiles = import.meta.glob("./assets/covers/*.jpg", {
  eager: true,
  import: "default",
});

export function getCover(gameId) {
  return coverFiles["./assets/covers/" + gameId + ".jpg"] ?? null;
}
