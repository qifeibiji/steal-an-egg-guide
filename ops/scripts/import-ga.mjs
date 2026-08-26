import fs from "node:fs";
import { defaultStateDir, numberValue, nowIso, stateFile, writeJson } from "./ops-core.mjs";
import { recordsFromCsv, valueFor } from "./csv-utils.mjs";

export function normalizeGaCsv(text, fallbackDate = new Date().toISOString().slice(0, 10)) {
  return recordsFromCsv(text).map((record) => ({
    date: valueFor(record, ["date"]) || fallbackDate,
    pagePath: valueFor(record, ["pagepath", "page path and screen class", "page path"]),
    screenPageViews: numberValue(valueFor(record, ["screenpageviews", "views", "screen page views"])),
    activeUsers: numberValue(valueFor(record, ["activeusers", "active users"])),
    sessions: numberValue(valueFor(record, ["sessions"])),
  })).filter((record) => record.pagePath);
}

function main() {
  const filePath = process.argv[2];
  if (!filePath) throw new Error("Usage: npm run ops:import-ga -- <csv>");
  const records = normalizeGaCsv(fs.readFileSync(filePath, "utf8"));
  const result = { status: "MANUAL_IMPORT", collector: "GA4", imported_at: nowIso(), records };
  writeJson(stateFile(defaultStateDir, "ga.json"), result);
  console.log(`MANUAL_GA_IMPORT_COMPLETE records=${records.length}`);
}

if (import.meta.main) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
