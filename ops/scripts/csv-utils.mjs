import { normalizeText, numberValue } from "./ops-core.mjs";

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

export function recordsFromCsv(text) {
  const rows = parseCsv(text);
  const headers = (rows.shift() || []).map((header) => normalizeText(header.replace(/^\uFEFF/, "")));
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])));
}

export function valueFor(record, aliases) {
  return aliases.map(normalizeText).map((alias) => record[alias]).find((value) => value !== undefined) || "";
}

export function percentage(value) {
  const numeric = numberValue(value);
  return String(value).includes("%") ? numeric / 100 : numeric;
}
