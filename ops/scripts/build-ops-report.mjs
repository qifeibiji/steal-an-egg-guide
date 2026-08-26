import fs from "node:fs";
import { defaultStateDir, readJson, reportFile, stateFile } from "./ops-core.mjs";

function countBy(values, property) {
  return Object.values(values || {}).reduce((counts, value) => {
    const key = value[property] || "UNKNOWN";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

export function buildOpsReport({ sourceState = { sources: {} }, gscState = { records: [] }, gaState = { records: [] }, queue = { candidates: [] }, validation = { valid: true, errors: [] } }) {
  const actionable = queue.candidates.filter((candidate) => candidate.type !== "NO_ACTION");
  const changedSources = Object.values(sourceState.sources || {}).filter((source) => source.status === "SOURCE_CHANGED");
  const fetchFailures = Object.values(sourceState.sources || {}).filter((source) => source.status === "FETCH_FAILED");
  const updateExisting = queue.candidates.filter((candidate) => candidate.type === "UPDATE_EXISTING");
  const newPageReview = queue.candidates.filter((candidate) => candidate.type === "NEW_PAGE_REVIEW");
  const conclusion = !validation.valid
    ? "VALIDATION_FAILED"
    : fetchFailures.length
      ? "MONITORING_ATTENTION_REQUIRED"
      : actionable.length
        ? "HUMAN_REVIEW_REQUIRED"
        : "NO_ACTION_REQUIRED";
  const actions = [
    ...fetchFailures.map((source) => `SOURCE_RECHECK: recheck the affected registered source ${source.id} (${source.fetch_failure}).`),
    ...actionable.map((candidate) => `${candidate.type}: review ${candidate.id}`),
  ].sort();
  if (actions.length === 0) actions.push("No human action is required.");
  const lines = [
    "# GAME SITE OPS REPORT", "", `## ${conclusion}`, "",
    "## 1. Source status", "", `- ${JSON.stringify(countBy(sourceState.sources, "status"))}`,
    "", "## 2. Changed sources", "", ...(changedSources.length ? changedSources.map((source) => `- ${source.id} (${source.url})`) : ["- None"]),
    "", "## 3. GSC summary", "", `- Status: ${gscState.status || "NO_DATA"}`, `- Records: ${gscState.records?.length || 0}`,
    "", "## 4. GA summary", "", `- Status: ${gaState.status || "NO_DATA"}`, `- Records: ${gaState.records?.length || 0}`,
    "", "## 5. Existing page opportunities", "", ...(updateExisting.length ? updateExisting.map((candidate) => `- ${candidate.affected.route}: ${candidate.affected.query}`) : ["- None"]),
    "", "## 6. New-page review candidates", "", ...(newPageReview.length ? newPageReview.map((candidate) => `- ${candidate.affected.query}`) : ["- None"]),
    "", "## 7. Errors / missing credentials", "", ...(fetchFailures.map((source) => `- Fetch failure: ${source.id} (${source.fetch_failure})`)),
    ...(gscState.status !== "COLLECTED" && gscState.status !== "MANUAL_IMPORT" ? [`- GSC: ${gscState.status || "NO_DATA"}`] : []),
    ...(gaState.status !== "COLLECTED" && gaState.status !== "MANUAL_IMPORT" ? [`- GA4: ${gaState.status || "NO_DATA"}`] : []),
    ...(!validation.valid ? validation.errors.map((error) => `- Validator: ${error}`) : []),
    "", "## 8. Recommended human actions", "", ...actions, "",
  ];
  return { conclusion, markdown: `${lines.join("\n")}\n` };
}

export function writeOpsReport(report) {
  fs.mkdirSync(new URL("../reports/", import.meta.url), { recursive: true });
  fs.writeFileSync(reportFile("ops-report.md"), report.markdown);
}

function main() {
  const sourceState = readJson(stateFile(defaultStateDir, "source-scan.json"), { sources: {} });
  const gscState = readJson(stateFile(defaultStateDir, "gsc.json"), { status: "NO_DATA", records: [] });
  const gaState = readJson(stateFile(defaultStateDir, "ga.json"), { status: "NO_DATA", records: [] });
  const queue = readJson(reportFile("candidate-queue.json"), { candidates: [] });
  const validation = readJson(reportFile("validation.json"), { valid: true, errors: [] });
  const report = buildOpsReport({ sourceState, gscState, gaState, queue, validation });
  writeOpsReport(report);
  console.log(`OPS_REPORT_COMPLETE ${report.conclusion}`);
}

if (import.meta.main) {
  try { main(); } catch (error) { console.error(`OPS_REPORT_FAILED ${error.message}`); process.exitCode = 1; }
}
