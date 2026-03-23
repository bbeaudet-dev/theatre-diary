const fs = require("node:fs");
const path = require("node:path");

const { previewForTitle } = require("./previewWikipediaProductionCandidates");

function loadShows() {
  const raw = fs.readFileSync(path.join("/tmp", "all-shows.json"), "utf8");
  const idx = raw.indexOf("[");
  if (idx === -1) {
    throw new Error("Unexpected shows:list output – no JSON array found");
  }
  return JSON.parse(raw.slice(idx));
}

function buildCandidateTitles(show) {
  const titles = [];
  const base = show.name;
  const lower = base.toLowerCase();
  if (/\(musical\)|\(play\)|\(opera\)/i.test(base)) {
    titles.push(base);
    return titles;
  }
  titles.push(base);
  if (show.type === "musical") {
    titles.push(`${base} (musical)`);
  } else if (show.type === "play") {
    titles.push(`${base} (play)`);
  }
  return titles;
}

function classifyQuality(preview) {
  const prods = preview.productions || [];
  if (prods.length === 0) return "poor";
  const nonOther = prods.filter((p) => p.district !== "other");
  if (prods.length >= 2 && nonOther.length >= 1) return "good";
  const p = prods[0];
  if (prods.length === 1 && p.district === "other" && p.approxStartYear == null) {
    return "weird";
  }
  return "ok";
}

function main() {
  const offset = process.argv[2] ? Number(process.argv[2]) || 0 : 0;
  const shows = loadShows();
  // Sample: wikidata-backed musicals or plays, with offset for pagination.
  const sample = shows
    .filter(
      (s) =>
        !s.isUserCreated &&
        s.externalSource === "wikidata" &&
        (s.type === "musical" || s.type === "play")
    )
    .slice(offset, offset + 20);

  const results = [];

  for (const show of sample) {
    const titles = buildCandidateTitles(show);
    let best = null;
    let tried = [];

    for (const title of titles) {
      tried.push(title);
      const preview = previewForTitle(title);
      if (!preview.found) continue;
      if ((preview.productions || []).length > 0) {
        best = { title, preview };
        break;
      }
      if (!best) {
        best = { title, preview };
      }
    }

    if (!best) {
      results.push({
        showName: show.name,
        type: show.type,
        status: "no_wikipedia_page",
        titlesTried: tried,
      });
      continue;
    }

    const { title, preview } = best;
    const quality = classifyQuality(preview);
    results.push({
      showName: show.name,
      type: show.type,
      wikipediaTitle: title,
      status: "found",
      quality,
      productionsCount: (preview.productions || []).length,
      districts: Array.from(
        new Set((preview.productions || []).map((p) => p.district))
      ),
      notes:
        quality === "weird"
          ? "Only one production, district=other, no years (e.g. Les Mis pattern)"
          : undefined,
    });
  }

  console.log(
    JSON.stringify(
      { offset, sampleSize: sample.length, results },
      null,
      2
    )
  );
}

main();

