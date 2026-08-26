import { dateDaysAgo, defaultStateDir, flagValue, nowIso, stateFile, writeJson } from "./ops-core.mjs";
import { googleApiAvailability, googleRequest } from "./google-client.mjs";

const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

export async function collectGsc({ env = process.env, stateDir = defaultStateDir, now = new Date(), windowDays = 7, request = googleRequest } = {}) {
  const availability = googleApiAvailability({ env });
  if (!availability.configured) {
    const result = { status: "GOOGLE_API_NOT_CONFIGURED", collector: "GSC", collected_at: nowIso(now), manual_import_available: true, records: [] };
    writeJson(stateFile(stateDir, "gsc.json"), result);
    return result;
  }
  const endDate = dateDaysAgo(1, now);
  const startDate = dateDaysAgo(windowDays, now);
  try {
    const data = await request({
      credentialPath: availability.credentialPath,
      scopes: [SEARCH_CONSOLE_SCOPE],
      url: `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(availability.gscSiteUrl)}/searchAnalytics/query`,
      data: { startDate, endDate, dimensions: ["date", "query", "page"], rowLimit: 25000 },
    });
    const records = (data.rows || []).map((row) => ({
      date: row.keys?.[0] || null, query: row.keys?.[1] || "", page: row.keys?.[2] || "",
      clicks: Number(row.clicks || 0), impressions: Number(row.impressions || 0),
      ctr: Number(row.ctr || 0), position: Number(row.position || 0),
    }));
    const result = { status: "COLLECTED", collector: "GSC", collected_at: nowIso(now), window_days: windowDays, records };
    writeJson(stateFile(stateDir, "gsc.json"), result);
    return result;
  } catch (error) {
    const result = { status: "GOOGLE_API_READ_FAILED", collector: "GSC", collected_at: nowIso(now), manual_import_available: true, error: error.message, records: [] };
    writeJson(stateFile(stateDir, "gsc.json"), result);
    return result;
  }
}

async function main() {
  const requested = Number(flagValue("--days") || 7);
  const windowDays = requested === 28 ? 28 : 7;
  const result = await collectGsc({ windowDays });
  console.log(`${result.status} MANUAL_IMPORT_AVAILABLE=${result.manual_import_available === true}`);
}

if (import.meta.main) main();
