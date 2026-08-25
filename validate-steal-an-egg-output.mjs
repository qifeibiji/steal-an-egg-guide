import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = "D:/Projects/gamesite";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function tableRows(markdown) {
  return markdown.split(/\r?\n/).filter((line) => /^\| \d+ \|/.test(line));
}

const task00 = read("evidence/task-00-keyword-research.md");
assert.match(task00, /FINAL_KEYWORD_LOCK\s*=\s*STEAL_AN_EGG/);
assert.match(task00, /Steal An Egg[\s\S]*SELECTED_MAIN_GAME/);
assert.match(task00, /Animal Hospital \(Anomaly\)[\s\S]*REJECT_THIS_ITERATION/);
assert.match(task00, /99 Nights in the Forest[\s\S]*FALLBACK_BASELINE/);
assert.match(task00, /SERP-relative assessment, not Ahrefs\/Semrush numeric KD/);

const task01 = read("evidence/task-01-keyword-evidence.md");
const keywordRows = tableRows(task01);
assert.ok(keywordRows.length >= 15, `expected 15+ candidate queries, found ${keywordRows.length}`);
assert.ok(keywordRows.filter((line) => line.includes("Include")).length >= 10, "expected 10+ included high-value queries");
assert.match(task01, /steal an egg codes/i);
assert.match(task01, /no active Codes|no functioning Codes system|no redemption menu/i);

const task02 = read("evidence/task-02-page-matrix.md");
const pageRows = tableRows(task02);
assert.equal(pageRows.length, 8, `expected 8 MVP pages, found ${pageRows.length}`);
for (const slug of ["/", "/guides/", "/guides/beginner-guide/", "/guides/eggs-pets-income/", "/guides/speed-treadmill-biomes/", "/guides/base-upgrades-money/", "/guides/admin-abuse-events/", "/guides/codes/"]) {
  assert.ok(task02.includes(`\`${slug}\``), `missing page slug ${slug}`);
}

const task03 = read("evidence/task-03-source-registry.md");
const sourceRowsOnly = task03.split("## Source coverage check")[0];
for (const slug of ["/", "/guides/", "/guides/beginner-guide/", "/guides/eggs-pets-income/", "/guides/speed-treadmill-biomes/", "/guides/base-upgrades-money/", "/guides/admin-abuse-events/", "/guides/codes/"]) {
  const matches = sourceRowsOnly.split(/\r?\n/).filter((line) => line.startsWith(`| \`${slug}\` |`));
  assert.equal(matches.length, 2, `${slug} must have exactly two source rows`);
}

console.log("Steal An Egg Gate 1–3 evidence validation passed.");
