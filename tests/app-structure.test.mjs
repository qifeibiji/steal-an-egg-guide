import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");

test("provides a static Next route and SEO asset for every Task 4 requirement", () => {
  const requiredFiles = [
    "app/layout.tsx",
    "app/page.tsx",
    "app/guides/page.tsx",
    "app/guides/beginner-guide/page.tsx",
    "app/guides/eggs-pets-income/page.tsx",
    "app/guides/speed-treadmill-biomes/page.tsx",
    "app/guides/base-upgrades-money/page.tsx",
    "app/guides/admin-abuse-events/page.tsx",
    "app/guides/codes/page.tsx",
    "app/robots.ts",
    "app/sitemap.ts",
    "components/site-shell.tsx",
    "components/guide-page.tsx",
    "app/globals.css",
    "scripts/validate-site.mjs"
  ];

  for (const relativePath of requiredFiles) {
    assert.ok(fs.existsSync(path.join(root, relativePath)), `${relativePath} must exist`);
  }
});

test("uses the dark game wiki presentation without adding new routes", () => {
  const css = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8");
  const home = fs.readFileSync(path.join(root, "components", "home-page.tsx"), "utf8");
  const guide = fs.readFileSync(path.join(root, "components", "guide-page.tsx"), "utf8");
  const shell = fs.readFileSync(path.join(root, "components", "site-shell.tsx"), "utf8");

  assert.match(css, /--surface-0:\s*#[0-9a-f]{6}/i, "dark surface token must exist");
  assert.match(css, /--cyan:\s*#[0-9a-f]{6}/i, "cyan accent token must exist");
  assert.match(css, /\.quick-reference/, "quick-reference card styling must exist");
  assert.match(home, /Quick reference/, "home must include the quick reference module");
  assert.match(home, /Site snapshot/, "home must include the site snapshot module");
  assert.match(home, /No verified active codes/, "home must keep the verified codes status");
  assert.match(guide, /guide-groups/, "guide hub must group the current guide cards");
  assert.match(shell, /label: "Status"/, "header status link must use an existing page");
});

test("renders content checklists and reader-friendly checked dates", () => {
  const guide = fs.readFileSync(path.join(root, "components", "guide-page.tsx"), "utf8");

  assert.match(guide, /section\.items/, "guide sections must support structured lists");
  assert.match(guide, /article-list/, "guide lists need a stable presentation hook");
  assert.match(guide, /Last checked:/, "update-sensitive pages need a clear checked-date label");
});
