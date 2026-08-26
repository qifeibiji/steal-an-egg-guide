import fs from "node:fs";
import { readConfig, readJson, defaultStateDir, nowIso, reportFile, stateFile, writeJson, normalizeText } from "./ops-core.mjs";

function makeCandidate({ type, id, affected, evidence, generatedAt }) {
  return {
    id: `${type}:${id}`,
    type,
    approval_status: type === "NO_ACTION" ? "NOT_REQUIRED" : "PENDING_HUMAN_REVIEW",
    action: type === "NO_ACTION" ? "NONE" : "HUMAN_REVIEW_REQUIRED",
    affected,
    evidence,
    generated_at: generatedAt,
  };
}

function mappedPageForQuery(pages, query) {
  const normalized = normalizeText(query);
  return pages.find((page) => page.mapped_queries.some((mappedQuery) => normalizeText(mappedQuery) === normalized));
}

function qualifies(record, queueConfig) {
  return record.impressions >= queueConfig.minimum_impressions
    || (queueConfig.include_queries_with_clicks && record.clicks > 0);
}

export function buildCandidateQueue({ pages, sourceState = { sources: {} }, gscState = { records: [] }, config, generatedAt = nowIso() }) {
  const queueConfig = config.queue || config;
  const candidates = [];
  for (const source of Object.values(sourceState.sources || {})) {
    if (source.changed_since_last_check === true && source.status === "SOURCE_CHANGED") {
      candidates.push(makeCandidate({
        type: "SOURCE_RECHECK", id: source.id,
        affected: { source_id: source.id, target_pages: source.target_pages || [] },
        evidence: [{ kind: "source_scan", source_id: source.id, url: source.url, previous_fingerprint: source.previous_fingerprint || null, fingerprint: source.fingerprint, checked_at: source.checked_at }],
        generatedAt,
      }));
    }
  }
  const gscRecords = Array.isArray(gscState.records) ? gscState.records.filter((record) => qualifies(record, queueConfig)) : [];
  for (const record of gscRecords) {
    const page = mappedPageForQuery(pages, record.query);
    candidates.push(makeCandidate({
      type: page ? "UPDATE_EXISTING" : "NEW_PAGE_REVIEW",
      id: `${page?.route || "unmapped"}:${normalizeText(record.query)}`,
      affected: page ? { route: page.route, query: record.query } : { query: record.query },
      evidence: [{ kind: "gsc", ...record }],
      generatedAt,
    }));
  }
  if (candidates.length === 0) {
    candidates.push(makeCandidate({
      type: "NO_ACTION", id: "no-qualified-signals", affected: {},
      evidence: [{ kind: "gsc", status: gscState.status || "NO_DATA", record_count: gscState.records?.length || 0 }], generatedAt,
    }));
  }
  candidates.sort((left, right) => left.id.localeCompare(right.id));
  return { version: 1, generated_at: generatedAt, candidates };
}

export function candidateQueueMarkdown(queue) {
  const lines = ["# Content Ops Candidate Queue", "", `Generated: ${queue.generated_at}`, ""];
  for (const candidate of queue.candidates) {
    lines.push(`## ${candidate.type}`, "", `- ID: ${candidate.id}`, `- Approval: ${candidate.approval_status}`, `- Action: ${candidate.action}`, `- Affected: \`${JSON.stringify(candidate.affected)}\``, `- Evidence: \`${JSON.stringify(candidate.evidence)}\``, "");
  }
  return `${lines.join("\n").trim()}\n`;
}

export function writeCandidateQueue(queue) {
  writeJson(reportFile("candidate-queue.json"), queue);
  const markdownPath = reportFile("candidate-queue.md");
  writeJson(reportFile("actionable.json"), {
    actionable: queue.candidates.some((candidate) => candidate.type !== "NO_ACTION"),
    generated_at: queue.generated_at,
  });
  fs.writeFileSync(markdownPath, candidateQueueMarkdown(queue));
}

async function main() {
  const pageRegistry = readConfig("pages.json");
  const config = readConfig("ops.config.json");
  const sourceState = readJson(stateFile(defaultStateDir, "source-scan.json"), { sources: {} });
  const gscState = readJson(stateFile(defaultStateDir, "gsc.json"), { status: "NO_DATA", records: [] });
  const queue = buildCandidateQueue({ pages: pageRegistry.pages, sourceState, gscState, config: config.queue });
  writeCandidateQueue(queue);
  console.log(`CANDIDATE_QUEUE_COMPLETE candidates=${queue.candidates.length}`);
}

if (import.meta.main) {
  main().catch((error) => { console.error(`CANDIDATE_QUEUE_FAILED ${error.message}`); process.exitCode = 1; });
}
