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
