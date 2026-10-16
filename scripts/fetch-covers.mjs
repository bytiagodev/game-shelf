// Downloads each game's portrait cover into src/assets/covers/<id>.jpg so the
// site never depends on Steam's links staying valid. A game's coverUrl is
// used when set; otherwise the cover is looked up on Steam from steamAppId.
// Existing files are kept; pass --force to download every cover again.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { games } from "../src/data/games.js";

const coversFolder = fileURLToPath(new URL("../src/assets/covers/", import.meta.url));
const forceDownload = process.argv.includes("--force");
const isJpeg = (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

// Steam's store API lists each app's current portrait art. Newer covers sit
// behind hashed paths, so they can't be guessed from the app ID alone.
async function findSteamCover(steamAppId) {
  const request = {
    ids: [{ appid: steamAppId }],
    context: { language: "english", country_code: "PT" },
    data_request: { include_assets: true },
  };
  const response = await fetch(
    "https://api.steampowered.com/IStoreBrowseService/GetItems/v1/?input_json=" +
      encodeURIComponent(JSON.stringify(request)),
  );
  if (!response.ok) throw new Error("Steam lookup failed with HTTP " + response.status);
  const assets = (await response.json()).response?.store_items?.[0]?.assets;
  const fileName = assets?.library_capsule_2x || assets?.library_capsule;
  if (!assets?.asset_url_format || !fileName) throw new Error("Steam lists no portrait cover");
  return (
    "https://shared.fastly.steamstatic.com/store_item_assets/" +
    assets.asset_url_format.replace("${FILENAME}", fileName)
  );
}

mkdirSync(coversFolder, { recursive: true });

let failureCount = 0;
for (const game of games) {
  const coverPath = coversFolder + game.id + ".jpg";
  if (existsSync(coverPath) && !forceDownload) continue;
  if (!game.coverUrl && !game.steamAppId) {
    console.log("No coverUrl or steamAppId: " + game.id);
    continue;
  }
  try {
    const coverUrl = game.coverUrl || (await findSteamCover(game.steamAppId));
    const response = await fetch(coverUrl);
    if (!response.ok) throw new Error("HTTP " + response.status);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!isJpeg(bytes)) throw new Error("the file is not a JPEG");
    writeFileSync(coverPath, bytes);
    console.log(
      "Saved:        " +
        game.id +
        " (" +
        Math.round(bytes.length / 1024) +
        " KB" +
        (game.coverUrl ? "" : ", found on Steam") +
        ")",
    );
  } catch (error) {
    failureCount += 1;
    console.log("Failed:       " + game.id + ": " + error.message);
  }
}

if (failureCount) {
  console.log("\n" + failureCount + " cover(s) failed. Check those coverUrl or steamAppId values.");
  process.exitCode = 1;
} else {
  console.log("\nAll covers are saved.");
}
