import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildCandidateQueue } from "../ops/scripts/build-candidate-queue.mjs";
import { buildOpsReport } from "../ops/scripts/build-ops-report.mjs";
import { collectGa } from "../ops/scripts/collect-ga.mjs";
import { collectGsc } from "../ops/scripts/collect-gsc.mjs";
import { normalizeGscCsv } from "../ops/scripts/import-gsc.mjs";
import { collectWithManualFallback } from "../ops/scripts/run-ops.mjs";
import { scanSources, sourceFetchOptions } from "../ops/scripts/source-scan.mjs";
import { validateOps } from "../ops/scripts/validate-ops.mjs";

const source = {
  id: "official-experience",
  url: "https://example.test/source",
  source_name: "Fixture source",
  source_type: "fixture",
  target_pages: ["/"],
  update_sensitive: true,
  enabled: true,
  checked_at: "2026-08-25",
  priority: "high",
};

const pages = [{
  route: "/",
  page_type: "hub",
  primary_topic: "Steal An Egg",
  mapped_queries: ["steal an egg"],
  update_sensitive: true,
  current_sources: ["official-experience"],
  checked_date_required: true,
}];

const config = {
  queue: {
    minimum_impressions: 10,
    include_queries_with_clicks: true,
  },
};

function response(body, headers = {}) {
  return new Response(body, { status: 200, headers });
}

test("first successful source scan records a baseline without a change signal", async () => {
  const result = await scanSources({
    sources: [source],
    previousState: { sources: {} },
    fetcher: async () => response("<main>Initial version</main>", { etag: "v1" }),
    now: new Date("2026-08-26T00:00:00.000Z"),
    delay: async () => {},
  });

  assert.equal(result.sources["official-experience"].status, "BASELINE_ONLY");
  assert.equal(result.sources["official-experience"].changed_since_last_check, false);
  assert.match(result.sources["official-experience"].fingerprint, /^[a-f0-9]{64}$/);
});

test("a changed source fingerprint creates an evidence-backed SOURCE_RECHECK candidate", async () => {
  const baseline = await scanSources({
    sources: [source],
    previousState: { sources: {} },
    fetcher: async () => response("<main>Initial version</main>"),
    now: new Date("2026-08-26T00:00:00.000Z"),
    delay: async () => {},
  });
  const changed = await scanSources({
    sources: [source],
    previousState: baseline,
    fetcher: async () => response("<main>Changed version</main>"),
    now: new Date("2026-08-27T00:00:00.000Z"),
    delay: async () => {},
  });

  const queue = buildCandidateQueue({
    pages,
    sourceState: changed,
    gscState: { status: "NO_DATA", records: [] },
    config,
    generatedAt: "2026-08-27T00:00:00.000Z",
  });
  const candidate = queue.candidates.find((entry) => entry.type === "SOURCE_RECHECK");

  assert.ok(candidate);
  assert.equal(candidate.approval_status, "PENDING_HUMAN_REVIEW");
  assert.equal(candidate.evidence[0].source_id, "official-experience");
});

test("GSC and GA collectors degrade safely when Google credentials are absent", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "game-site-ops-"));
  try {
    const options = { env: {}, stateDir: tempDir, now: new Date("2026-08-26T00:00:00.000Z") };
    const [gsc, ga] = await Promise.all([collectGsc(options), collectGa(options)]);

    assert.equal(gsc.status, "GOOGLE_API_NOT_CONFIGURED");
    assert.equal(ga.status, "GOOGLE_API_NOT_CONFIGURED");
    assert.equal(gsc.manual_import_available, true);
    assert.equal(ga.manual_import_available, true);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("manual GSC CSV fallback normalizes common export headings", () => {
  const records = normalizeGscCsv([
    "Top queries,Top pages,Clicks,Impressions,CTR,Position",
    "steal an egg,/guides/,2,14,14.29%,5.4",
  ].join("\n"), "2026-08-26");

  assert.deepEqual(records, [{
    date: "2026-08-26",
    query: "steal an egg",
    page: "/guides/",
    clicks: 2,
    impressions: 14,
    ctr: 0.1429,
    position: 5.4,
  }]);
});

test("candidate queue accepts the queue-settings object used by its CLI callers", () => {
  const queue = buildCandidateQueue({
    pages,
    sourceState: { sources: {} },
    gscState: {
      status: "MANUAL_IMPORT",
      records: [{ date: "2026-08-26", query: "steal an egg", page: "/guides/", clicks: 2, impressions: 14, ctr: 0.1429, position: 5.4 }],
    },
    config: config.queue,
    generatedAt: "2026-08-26T00:00:00.000Z",
  });

  assert.equal(queue.candidates[0].type, "UPDATE_EXISTING");
});

test("one-command runs preserve a manual GSC import when Google API access is unavailable", async () => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), "game-site-ops-"));
  try {
    const imported = { status: "MANUAL_IMPORT", collector: "GSC", records: [{ query: "steal an egg" }] };
    fs.writeFileSync(path.join(stateDir, "gsc.json"), JSON.stringify(imported));
    let collectorCalled = false;
    const result = await collectWithManualFallback({
      stateDir,
      fileName: "gsc.json",
      collector: async () => {
        collectorCalled = true;
        return { status: "GOOGLE_API_NOT_CONFIGURED", records: [] };
      },
    });

    assert.deepEqual(result, imported);
    assert.equal(collectorCalled, false);
  } finally {
    fs.rmSync(stateDir, { recursive: true, force: true });
  }
});

test("one-command runs prefer configured Google API data over an older manual import", async () => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), "game-site-ops-"));
  try {
    fs.writeFileSync(path.join(stateDir, "gsc.json"), JSON.stringify({ status: "MANUAL_IMPORT", collector: "GSC", records: [{ query: "old csv" }] }));
    let collectorCalled = false;
    const collected = { status: "COLLECTED", collector: "GSC", records: [{ query: "api data" }] };
    const result = await collectWithManualFallback({
      stateDir,
      fileName: "gsc.json",
      apiAvailable: true,
      collector: async () => {
        collectorCalled = true;
        return collected;
      },
    });

    assert.deepEqual(result, collected);
    assert.equal(collectorCalled, true);
  } finally {
    fs.rmSync(stateDir, { recursive: true, force: true });
  }
});

test("validator rejects candidate types outside the four human-gated types", () => {
  const result = validateOps({
    sources: [],
    pageRegistry: { pages: [] },
    sourceState: { sources: {} },
    queue: { candidates: [{ id: "invalid-type", type: "AUTO_PUBLISH", action: "NONE", evidence: [{ kind: "fixture" }] }] },
    productionRoutes: new Set(),
    trackedCredentials: [],
  });

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /Unsupported candidate type: AUTO_PUBLISH/);
});

test("source monitor requests never follow a redirect outside the registered URL", () => {
  const options = sourceFetchOptions({
    request_timeout_ms: 15000,
    user_agent: "FixtureSourceMonitor/1.0",
  });

  assert.equal(options.redirect, "manual");
  assert.equal(options.headers["user-agent"], "FixtureSourceMonitor/1.0");
});

test("fetch failures require monitoring attention instead of a no-action conclusion", () => {
  const report = buildOpsReport({
    sourceState: { sources: { unavailable: { id: "unavailable", status: "FETCH_FAILED", fetch_failure: "HTTP_503" } } },
    gscState: { status: "GOOGLE_API_NOT_CONFIGURED", records: [] },
    gaState: { status: "GOOGLE_API_NOT_CONFIGURED", records: [] },
    queue: { candidates: [{ type: "NO_ACTION" }] },
    validation: { valid: true, errors: [] },
  });

  assert.equal(report.conclusion, "MONITORING_ATTENTION_REQUIRED");
  assert.match(report.markdown, /recheck the affected registered source/i);
});
