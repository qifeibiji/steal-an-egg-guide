import fs from "node:fs";
import path from "node:path";

export const repoRoot = path.resolve(import.meta.dirname, "..", "..");
export const configDir = path.join(repoRoot, "ops", "config");
export const reportsDir = path.join(repoRoot, "ops", "reports");
export const defaultStateDir = path.join(repoRoot, ".ops-state");

export function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

export function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeJson(filePath, value) {
  ensureDirectory(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function readConfig(fileName) {
  return readJson(path.join(configDir, fileName), null);
}

export function stateFile(stateDir, fileName) {
  return path.join(stateDir || defaultStateDir, fileName);
}

export function reportFile(fileName) {
  return path.join(reportsDir, fileName);
}

export function nowIso(now = new Date()) {
  return now.toISOString();
}

export function dateDaysAgo(days, now = new Date()) {
  const value = new Date(now);
  value.setUTCDate(value.getUTCDate() - days);
  return value.toISOString().slice(0, 10);
}

export function flagValue(name, args = process.argv.slice(2)) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

export function numberValue(value, fallback = 0) {
  const parsed = Number(String(value ?? "").replace(/[%,$]/g, "").trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function uniqueSorted(values) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}
