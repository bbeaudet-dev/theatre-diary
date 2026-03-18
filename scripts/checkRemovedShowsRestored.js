const fs = require("node:fs");
const path = require("node:path");

// The sample of shows we wiped earlier (non-Wikidata) that you care about.
const REMOVED = [
  "Mexodus",
  "Phantom of the Opera",
  "Operation Mincemeat",
  "Death Becomes Her",
  "Les Misérables",
  "Hamilton",
  "Two Strangers (Carry a Cake Across New York)",
  "Sunset Blvd.",
  "Marcel on the Train",
  "Cabaret",
  "Gypsy",
  "Punch",
  "Oedipus",
  "Water for Elephants",
  "High Spirits",
  "POTUS",
  "The Heart of Robin Hood",
  "Floyd Collins",
  "The Disappear",
  "Moulin Rouge",
];

function normalize(name) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function main() {
  const raw = fs.readFileSync(path.join("/tmp", "shows-after-wikidata-reimport.json"), "utf8");
  const idx = raw.indexOf("[");
  if (idx === -1) throw new Error("Unexpected shows:list output");
  const shows = JSON.parse(raw.slice(idx));

  const byNorm = new Map();
  for (const s of shows) {
    const n = normalize(s.name);
    if (!byNorm.has(n)) byNorm.set(n, []);
    byNorm.get(n).push(s);
  }

  const items = REMOVED.map((name) => {
    const n = normalize(name);
    const matches = byNorm.get(n) || [];
    const wikidataMatches = matches.filter(
      (s) => s.externalSource === "wikidata" && typeof s.externalId === "string"
    );
    const any = matches[0];
    const wikidata = wikidataMatches[0];
    return {
      name,
      normalized: n,
      restored: !!any,
      restoredAs: any ? any.name : null,
      externalSource: any ? any.externalSource || null : null,
      externalId: any ? any.externalId || null : null,
      wikidataRestored: !!wikidata,
      wikidataName: wikidata ? wikidata.name : null,
      wikidataId: wikidata ? wikidata.externalId : null,
    };
  });

  console.log(
    JSON.stringify(
      {
        removedCount: REMOVED.length,
        restoredCount: items.filter((i) => i.restored).length,
        wikidataRestoredCount: items.filter((i) => i.wikidataRestored).length,
        items,
      },
      null,
      2
    )
  );
}

main();

