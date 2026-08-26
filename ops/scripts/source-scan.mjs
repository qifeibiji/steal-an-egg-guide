import { createHash } from "node:crypto";
import { readConfig, readJson, defaultStateDir, nowIso, stateFile, writeJson } from "./ops-core.mjs";

export function normalizeSourceContent(value) {
  return String(value ?? "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function fingerprintContent(value) {
  return createHash("sha256").update(normalizeSourceContent(value), "utf8").digest("hex");
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function sourceFetchOptions(sourceMonitor) {
  return {
    headers: { "user-agent": sourceMonitor.user_agent },
    signal: AbortSignal.timeout(sourceMonitor.request_timeout_ms),
    redirect: "manual",
  };
}

export async function scanSources({ sources, previousState = { sources: {} }, fetcher = fetch, now = new Date(), delay = sleep, minRequestDelay = 0 }) {
  const next = { version: 1, generated_at: nowIso(now), sources: {} };
  const enabledSources = sources.filter((source) => source.enabled);

  for (const [index, source] of enabledSources.entries()) {
    if (index > 0 && minRequestDelay > 0) await delay(minRequestDelay);
    const previous = previousState.sources?.[source.id];
    const checkedAt = nowIso(now);
    try {
      const response = await fetcher(source.url, source);
      const httpStatus = response.status;
      const etag = response.headers?.get?.("etag") || null;
      const lastModified = response.headers?.get?.("last-modified") || null;
      if (!response.ok) {
        next.sources[source.id] = {
          id: source.id, url: source.url, target_pages: source.target_pages, checked_at: checkedAt, http_status: httpStatus,
          etag, last_modified: lastModified, fingerprint: previous?.fingerprint || null,
          changed_since_last_check: false, status: "FETCH_FAILED", fetch_failure: `HTTP_${httpStatus}`,
        };
        continue;
      }
      const fingerprint = fingerprintContent(await response.text());
      const isBaseline = !previous?.fingerprint;
      const changed = !isBaseline && previous.fingerprint !== fingerprint;
      next.sources[source.id] = {
        id: source.id, url: source.url, target_pages: source.target_pages, checked_at: checkedAt, http_status: httpStatus,
        etag, last_modified: lastModified, fingerprint, changed_since_last_check: changed,
        status: isBaseline ? "BASELINE_ONLY" : changed ? "SOURCE_CHANGED" : "UNCHANGED",
        fetch_failure: null,
      };
    } catch (error) {
      next.sources[source.id] = {
        id: source.id, url: source.url, target_pages: source.target_pages, checked_at: checkedAt, http_status: null,
        etag: null, last_modified: null, fingerprint: previous?.fingerprint || null,
        changed_since_last_check: false, status: "FETCH_FAILED", fetch_failure: error.message,
      };
    }
  }

  return next;
}

async function main() {
  const sources = readConfig("sources.json");
  const config = readConfig("ops.config.json");
  const filePath = stateFile(defaultStateDir, "source-scan.json");
  const previousState = readJson(filePath, { sources: {} });
  const fetcher = (url) => fetch(url, sourceFetchOptions(config.source_monitor));
  const result = await scanSources({
    sources, previousState, fetcher,
    minRequestDelay: config.source_monitor.min_request_delay_ms,
  });
  writeJson(filePath, result);
  const statuses = Object.values(result.sources).map((entry) => `${entry.id}:${entry.status}`);
  console.log(`SOURCE_SCAN_COMPLETE ${statuses.join(" ")}`);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(`SOURCE_SCAN_FAILED ${error.message}`);
    process.exitCode = 1;
  });
}
