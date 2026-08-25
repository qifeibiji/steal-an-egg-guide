import assert from "node:assert/strict";

const baseUrl = (process.env.SITE_SMOKE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const requiredRoutes = [
  "/",
  "/guides/",
  "/guides/beginner-guide/",
  "/guides/eggs-pets-income/",
  "/guides/speed-treadmill-biomes/",
  "/guides/base-upgrades-money/",
  "/guides/admin-abuse-events/",
  "/guides/codes/"
];
const placeholderPattern = /\b(TODO|FIXME|lorem ipsum|debug UI|placeholder text)\b/i;

function internalLinks(html) {
  const links = new Set();

  for (const match of html.matchAll(/\shref="([^"]+)"/gi)) {
    const href = match[1];
    if (href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/_next/")) {
      links.add(href.split("#")[0].split("?")[0]);
    }
  }

  return [...links];
}

function hasDescription(html) {
  return [...html.matchAll(/<meta\s+[^>]*>/gi)].some((tag) => (
    /\bname="description"/i.test(tag[0]) && /\bcontent="[^"]+"/i.test(tag[0])
  ));
}

async function request(path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "follow" });
  const html = await response.text();
  assert.equal(response.status, 200, `${path} returned ${response.status}`);
  return html;
}

const discoveredLinks = new Set();

for (const route of requiredRoutes) {
  const html = await request(route);
  assert.match(html, /<title>[^<]+<\/title>/i, `${route} is missing a title`);
  assert.ok(hasDescription(html), `${route} is missing a meta description`);
  assert.equal((html.match(/<h1(?:\s[^>]*)?>/gi) || []).length, 1, `${route} must render exactly one H1`);
  assert.doesNotMatch(html, placeholderPattern, `${route} contains placeholder or debug text`);
  for (const link of internalLinks(html)) discoveredLinks.add(link);
}

for (const link of discoveredLinks) {
  const response = await fetch(`${baseUrl}${link}`, { redirect: "follow" });
  assert.equal(response.status, 200, `Broken internal link: ${link}`);
}

const robots = await request("/robots.txt");
assert.match(robots, /User-Agent:\s*\*/i, "robots.txt must allow general crawling");
assert.match(robots, /Sitemap:/i, "robots.txt must advertise the sitemap");

const sitemap = await request("/sitemap.xml");
for (const route of requiredRoutes) {
  assert.ok(sitemap.includes(`${baseUrl}${route}`), `sitemap is missing ${route}`);
}

console.log(`Validation PASS: ${requiredRoutes.length}/8 routes, metadata, H1, links, robots, sitemap.`);
