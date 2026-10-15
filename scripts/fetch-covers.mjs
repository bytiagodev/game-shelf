// Downloads each game's coverUrl into src/assets/covers/<id>.jpg so the site
// never depends on Steam's links staying valid. Existing files are kept;
// pass --force to download every cover again.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { games } from "../src/data/games.js";

const coversFolder = fileURLToPath(new URL("../src/assets/covers/", import.meta.url));
const forceDownload = process.argv.includes("--force");
const isJpeg = (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

mkdirSync(coversFolder, { recursive: true });

let failureCount = 0;
for (const game of games) {
  const coverPath = coversFolder + game.id + ".jpg";
  if (existsSync(coverPath) && !forceDownload) continue;
  if (!game.coverUrl) {
    console.log("No coverUrl:   " + game.id);
    continue;
  }
  try {
    const response = await fetch(game.coverUrl);
    if (!response.ok) throw new Error("HTTP " + response.status);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!isJpeg(bytes)) throw new Error("the file is not a JPEG");
    writeFileSync(coverPath, bytes);
    console.log("Saved:        " + game.id + " (" + Math.round(bytes.length / 1024) + " KB)");
  } catch (error) {
    failureCount += 1;
    console.log("Failed:       " + game.id + ": " + error.message);
  }
}

if (failureCount) {
  console.log("\n" + failureCount + " cover(s) failed. Check those coverUrl values.");
  process.exitCode = 1;
} else {
  console.log("\nAll covers are saved.");
}
