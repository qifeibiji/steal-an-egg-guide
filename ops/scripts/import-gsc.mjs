import fs from "node:fs";
import { defaultStateDir, numberValue, nowIso, stateFile, writeJson } from "./ops-core.mjs";
import { percentage, recordsFromCsv, valueFor } from "./csv-utils.mjs";

export function normalizeGscCsv(text, fallbackDate = new Date().toISOString().slice(0, 10)) {
  return recordsFromCsv(text).map((record) => ({
    date: valueFor(record, ["date"]) || fallbackDate,
    query: valueFor(record, ["query", "top queries"]),
    page: valueFor(record, ["page", "top pages"]),
    clicks: numberValue(valueFor(record, ["clicks"])),
    impressions: numberValue(valueFor(record, ["impressions"])),
    ctr: percentage(valueFor(record, ["ctr"])),
    position: numberValue(valueFor(record, ["position", "average position"])),
  })).filter((record) => record.query || record.page);
}

function main() {
  const filePath = process.argv[2];
  if (!filePath) throw new Error("Usage: npm run ops:import-gsc -- <csv>");
  const records = normalizeGscCsv(fs.readFileSync(filePath, "utf8"));
  const result = { status: "MANUAL_IMPORT", collector: "GSC", imported_at: nowIso(), records };
  writeJson(stateFile(defaultStateDir, "gsc.json"), result);
  console.log(`MANUAL_GSC_IMPORT_COMPLETE records=${records.length}`);
}

if (import.meta.main) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
