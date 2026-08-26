import { execFileSync } from "node:child_process";
import { readConfig, readJson, repoRoot, reportFile, stateFile, defaultStateDir, writeJson } from "./ops-core.mjs";

const REQUIRED_SOURCE_FIELDS = ["id", "url", "source_name", "source_type", "target_pages", "update_sensitive", "enabled", "checked_at", "priority"];
const ALLOWED_CANDIDATE_TYPES = new Set(["UPDATE_EXISTING", "NEW_PAGE_REVIEW", "SOURCE_RECHECK", "NO_ACTION"]);

function trackedCredentialFiles() {
  try {
    return execFileSync("git", ["ls-files", "--", ".secrets"], { cwd: repoRoot, encoding: "utf8" })
      .split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}

export function validateOps({ sources, pageRegistry, sourceState = { sources: {} }, queue = { candidates: [] }, productionRoutes, trackedCredentials = trackedCredentialFiles() }) {
  const errors = [];
  if (!Array.isArray(sources)) errors.push("Malformed source registry: expected an array.");
  const sourceIds = new Set();
  for (const source of Array.isArray(sources) ? sources : []) {
    for (const field of REQUIRED_SOURCE_FIELDS) if (!(field in source)) errors.push(`Malformed source registry: ${source.id || "unknown"} missing ${field}.`);
    if (sourceIds.has(source.id)) errors.push(`Duplicate source id: ${source.id}.`);
    sourceIds.add(source.id);
    try { new URL(source.url); } catch { errors.push(`Malformed source registry URL: ${source.id}.`); }
    for (const route of source.target_pages || []) if (!productionRoutes.has(route)) errors.push(`Unknown production route in source registry: ${route}.`);
  }
  for (const page of pageRegistry.pages || []) {
    if (!productionRoutes.has(page.route)) errors.push(`Unknown production route in page registry: ${page.route}.`);
    for (const sourceId of page.current_sources || []) if (!sourceIds.has(sourceId)) errors.push(`Unknown source id in page registry: ${sourceId}.`);
  }
  for (const credential of trackedCredentials) errors.push(`Credential file tracked by git: ${credential}.`);
  for (const source of Object.values(sourceState.sources || {})) {
    if (source.status === "BASELINE_ONLY" && source.changed_since_last_check) errors.push(`Baseline incorrectly flagged as change: ${source.id}.`);
  }
  for (const candidate of queue.candidates || []) {
    if (!ALLOWED_CANDIDATE_TYPES.has(candidate.type)) errors.push(`Unsupported candidate type: ${candidate.type}.`);
    if (!Array.isArray(candidate.evidence) || candidate.evidence.length === 0) errors.push(`Candidate without evidence: ${candidate.id}.`);
    if (candidate.type === "NEW_PAGE_REVIEW" && candidate.approval_status === "HUMAN_APPROVED") errors.push(`NEW_PAGE auto-approved: ${candidate.id}.`);
    if (candidate.type === "AUTO_PUBLISH" || candidate.action === "AUTO_PUBLISH") errors.push(`AUTO_PUBLISH action: ${candidate.id}.`);
  }
  return { valid: errors.length === 0, errors };
}

function main() {
  const sources = readConfig("sources.json");
  const pageRegistry = readConfig("pages.json");
  const productionPages = readJson(new URL("../../content/site-pages.json", import.meta.url), []);
  const productionRoutes = new Set(productionPages.map((page) => page.path));
  const sourceState = readJson(stateFile(defaultStateDir, "source-scan.json"), { sources: {} });
  const queue = readJson(reportFile("candidate-queue.json"), { candidates: [] });
  const result = validateOps({ sources, pageRegistry, sourceState, queue, productionRoutes });
  writeJson(reportFile("validation.json"), result);
  console.log(result.valid ? "OPS_VALIDATION_PASS" : `OPS_VALIDATION_FAIL ${result.errors.join(" | ")}`);
  if (!result.valid) process.exitCode = 1;
}

if (import.meta.main) main();
