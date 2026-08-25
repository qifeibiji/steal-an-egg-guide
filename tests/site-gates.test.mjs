import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const pageDataPath = path.join(root, "content", "site-pages.json");

function readPages() {
  assert.ok(fs.existsSync(pageDataPath), "content/site-pages.json must exist");
  return JSON.parse(fs.readFileSync(pageDataPath, "utf8"));
}

test("defines the locked eight-page Steal An Egg catalog", () => {
  const pages = readPages();
  const paths = pages.map((page) => page.path).sort();
  assert.deepEqual(paths, [
    "/",
    "/guides/",
    "/guides/admin-abuse-events/",
    "/guides/base-upgrades-money/",
    "/guides/beginner-guide/",
    "/guides/codes/",
    "/guides/eggs-pets-income/",
    "/guides/speed-treadmill-biomes/",
  ]);
});

test("gives every page unique SEO metadata and one primary heading", () => {
  const pages = readPages();
  const titles = pages.map((page) => page.title);
  const descriptions = pages.map((page) => page.description);

  assert.equal(new Set(titles).size, 8, "titles must be unique");
  assert.equal(new Set(descriptions).size, 8, "descriptions must be unique");

  for (const page of pages) {
    assert.ok(page.title.length >= 20, `${page.path} needs a meaningful title`);
    assert.ok(page.description.length >= 70, `${page.path} needs a meaningful description`);
    assert.ok(page.h1.length >= 8, `${page.path} needs one clear H1`);
    assert.ok(page.sections.length >= 2, `${page.path} needs useful article sections`);
    assert.equal(new Set(page.sources.map((source) => source.url)).size, 2, `${page.path} needs two recorded sources`);
  }
});

test("keeps update-sensitive claims honest", () => {
  const pages = readPages();
  const codes = pages.find((page) => page.path === "/guides/codes/");
  const events = pages.find((page) => page.path === "/guides/admin-abuse-events/");

  assert.equal(codes.checkedDate, "2026-08-25");
  assert.match(codes.h1, /Are There Any Codes/i);
  assert.match(codes.answer, /no (active )?codes|no redemption/i);
  assert.doesNotMatch(JSON.stringify(codes), /\bFREE\w{2,}\b|\bCODE\d+\b/i);
  assert.equal(events.checkedDate, "2026-08-25");
  assert.match(events.answer, /not confirmed|unconfirmed/i);
});
