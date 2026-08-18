// Standalone Node harness for Phase 2 task 6: "Run the full flow against
// real sentences from the shared test set, confirm highlights + map pins
// update correctly with real data."
//
// No backend, no browser, no test framework required - it re-implements the
// exact splitting/filtering logic used by HighlightedText.jsx and
// MapView.jsx (kept byte-for-byte in sync with those files, see comments
// below) and imports the real lib/confidence.js, then runs both against
// fixtures built from the real shared test set.
//
// Run with:  node scripts/qa-flow-check.mjs

import { getConfidenceBand } from "../src/lib/confidence.js";
import { qaFixtures } from "../src/dev/qaFixtures.js";

// --- Mirrors HighlightedText.jsx's part-building loop exactly ---
function buildHighlightParts(sentence, entities) {
  const sortedEntities = [...entities].sort((a, b) => a.start - b.start);
  const parts = [];
  let currentPosition = 0;

  sortedEntities.forEach((entity) => {
    const { start, end } = entity;
    if (start > currentPosition) {
      parts.push({ type: "text", value: sentence.slice(currentPosition, start) });
    }
    parts.push({ type: "entity", value: sentence.slice(start, end), text: entity.text });
    currentPosition = Math.max(currentPosition, end);
  });

  if (currentPosition < sentence.length) {
    parts.push({ type: "text", value: sentence.slice(currentPosition) });
  }
  return parts;
}

// --- Mirrors MapView.jsx's location-filtering logic exactly ---
function buildMapLocations(entities) {
  return entities
    .filter(
      (entity) =>
        entity.resolved &&
        typeof entity.resolved.lat === "number" &&
        typeof entity.resolved.lon === "number"
    )
    .map((entity) => ({
      name: entity.text,
      lat: entity.resolved.lat,
      lon: entity.resolved.lon,
    }));
}

// --- Mirrors the PATCHED ResolvedLocationsPanel.jsx logic (see below) ---
function buildResolvedCards(entities) {
  return entities.map((entity) => {
    if (!entity.resolved) {
      return { text: entity.text, status: "no_confident_match" };
    }
    const confidence = entity.resolved.confidence;
    return { text: entity.text, status: "resolved", band: getConfidenceBand(confidence) };
  });
}

let failures = 0;
let passed = 0;

console.log(`Running QA flow check against ${qaFixtures.length} fixtures from the shared test set\n`);

for (const fixture of qaFixtures) {
  const { id, category, sentence, response, notes } = fixture;
  const problems = [];

  // 1. Offset integrity: sentence.slice(start,end) must equal entity.text
  for (const entity of response.entities) {
    const sliced = sentence.slice(entity.start, entity.end);
    if (sliced !== entity.text) {
      problems.push(
        `offset mismatch: expected "${entity.text}", got "${sliced}" (start=${entity.start}, end=${entity.end})`
      );
    }
  }

  // 2. Highlighting must not throw and must reconstruct the full sentence
  let parts;
  try {
    parts = buildHighlightParts(sentence, response.entities);
    const rebuilt = parts.map((p) => p.value).join("");
    if (rebuilt !== sentence) {
      problems.push(`highlight reconstruction mismatch: "${rebuilt}" !== "${sentence}"`);
    }
  } catch (err) {
    problems.push(`HighlightedText logic threw: ${err.message}`);
  }

  // 3. Map pins: every entity WITH resolved coords should produce a pin;
  //    entities without resolved (no_confident_match) should be silently skipped, not crash
  let mapLocations;
  try {
    mapLocations = buildMapLocations(response.entities);
    const expectedPinCount = response.entities.filter(
      (e) => e.resolved && typeof e.resolved.lat === "number"
    ).length;
    if (mapLocations.length !== expectedPinCount) {
      problems.push(`map pin count mismatch: expected ${expectedPinCount}, got ${mapLocations.length}`);
    }
  } catch (err) {
    problems.push(`MapView logic threw: ${err.message}`);
  }

  // 4. Resolved-locations panel: must not crash on entities with no `resolved`
  let cards;
  try {
    cards = buildResolvedCards(response.entities);
  } catch (err) {
    problems.push(`ResolvedLocationsPanel logic threw: ${err.message}`);
  }

  // 5. Confidence banding sanity check against the documented thresholds
  for (const entity of response.entities) {
    if (!entity.resolved) continue;
    const pct = entity.resolved.confidence * 100;
    const band = getConfidenceBand(entity.resolved.confidence);
    const expectedBand = pct > 85 ? "high" : pct >= 60 ? "medium" : "low";
    if (band !== expectedBand) {
      problems.push(`confidence band mismatch for "${entity.text}": got ${band}, expected ${expectedBand} (${pct}%)`);
    }
  }

  const status = problems.length === 0 ? "PASS" : "FAIL";
  if (status === "FAIL") failures++;
  else passed++;

  console.log(`[${status}] #${id} (${category}): "${sentence}"`);
  if (notes) console.log(`        note: ${notes}`);
  if (mapLocations) console.log(`        entities=${response.entities.length} pins=${mapLocations.length} cards=${cards?.map((c) => c.status).join(",")}`);
  problems.forEach((p) => console.log(`        ✗ ${p}`));
  console.log();
}

console.log(`\n${passed}/${qaFixtures.length} fixtures passed, ${failures} failed.`);
process.exit(failures > 0 ? 1 : 0);
