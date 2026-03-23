const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const PROGRESS_PATH = path.join(__dirname, "wikipediaProductionsProgress.json");
const SHOWS_DUMP_PATH = path.join("/tmp", "all-shows.json");

function loadShows() {
  const raw = fs.readFileSync(SHOWS_DUMP_PATH, "utf8");
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(
      "Unexpected shows:list output in /tmp/all-shows.json – no JSON array found"
    );
  }
  return JSON.parse(raw.slice(start, end + 1));
}

function loadProgress() {
  if (!fs.existsSync(PROGRESS_PATH)) return { processedIds: [], errors: [] };
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf8"));
  } catch {
    return { processedIds: [], errors: [] };
  }
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), "utf8");
}

function buildWikipediaTitle(show) {
  // If we already imported specifically by title before, the name should match Wikipedia.
  // For now, use simple rules: for musicals/plays, try "Name (musical/play)" when needed.
  const base = show.name;
  if (base.includes("(") && base.includes(")")) return base;
  if (show.type === "musical") return `${base} (musical)`;
  if (show.type === "play") return `${base} (play)`;
  return base;
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function main() {
  const maxCount = process.argv[2] ? Number(process.argv[2]) || 0 : 0;
  const shows = loadShows();
  const progress = loadProgress();
  const processedSet = new Set(progress.processedIds || []);

  const candidates = shows.filter(
    (s) =>
      !s.isUserCreated &&
      s.externalSource === "wikidata" &&
      (s.type === "musical" || s.type === "play") &&
      !processedSet.has(String(s._id))
  );

  const toProcess = maxCount > 0 ? candidates.slice(0, maxCount) : candidates;

  console.log(
    `Found ${candidates.length} wikidata-backed musicals/plays to process; running on ${toProcess.length} this pass.`
  );

  for (const show of toProcess) {
    const idStr = String(show._id);
    const wikipediaTitle = buildWikipediaTitle(show);
    console.log(
      `\n=== Importing productions for "${show.name}" (${show.type}) via "${wikipediaTitle}" ===`
    );

    const payload = JSON.stringify(
      {
        showName: show.name,
        showType: show.type,
        wikipediaTitle,
      },
      null,
      0
    );

    try {
      // spawnSync with args array so the JSON payload is one argv; avoids shell splitting on apostrophes.
      const result = spawnSync(
        "npx",
        ["convex", "run", "seed:importWikipediaProductionsForShow", payload],
        {
          encoding: "utf8",
          maxBuffer: 10 * 1024 * 1024,
        }
      );
      if (result.error) throw result.error;
      if (result.status !== 0) {
        const stderr = (result.stderr || "").trim();
        throw new Error(stderr || `exit code ${result.status}`);
      }
      const out = (result.stdout || "").trim();
      if (out) console.log(out);
      processedSet.add(idStr);
      progress.processedIds = Array.from(processedSet);
      saveProgress(progress);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Error importing productions for "${show.name}": ${msg}`);
      progress.errors = progress.errors || [];
      progress.errors.push({
        showId: idStr,
        name: show.name,
        message: msg,
        at: new Date().toISOString(),
      });
      saveProgress(progress);
    }

    // Gentle delay between calls to be nice to Wikipedia.
    sleep(1500);
  }

  console.log(
    `\nDone. Total processed IDs recorded: ${progress.processedIds.length}. Errors: ${
      (progress.errors || []).length
    }.`
  );
}

main();

