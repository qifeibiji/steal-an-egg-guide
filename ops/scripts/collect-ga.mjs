import { dateDaysAgo, defaultStateDir, flagValue, nowIso, stateFile, writeJson } from "./ops-core.mjs";
import { googleApiAvailability, googleRequest } from "./google-client.mjs";

const ANALYTICS_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

export async function collectGa({ env = process.env, stateDir = defaultStateDir, now = new Date(), windowDays = 7, request = googleRequest } = {}) {
  const availability = googleApiAvailability({ env, requireGaProperty: true });
  if (!availability.configured) {
    const result = { status: "GOOGLE_API_NOT_CONFIGURED", collector: "GA4", collected_at: nowIso(now), manual_import_available: true, records: [] };
    writeJson(stateFile(stateDir, "ga.json"), result);
    return result;
  }
  try {
    const data = await request({
      credentialPath: availability.credentialPath,
      scopes: [ANALYTICS_SCOPE],
      url: `https://analyticsdata.googleapis.com/v1beta/properties/${availability.ga4PropertyId}:runReport`,
      data: {
        dateRanges: [{ startDate: `${windowDays}daysAgo`, endDate: "yesterday" }],
        dimensions: [{ name: "date" }, { name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }, { name: "sessions" }],
        limit: 25000,
      },
    });
    const records = (data.rows || []).map((row) => ({
      date: row.dimensionValues?.[0]?.value || null,
      pagePath: row.dimensionValues?.[1]?.value || "",
      screenPageViews: Number(row.metricValues?.[0]?.value || 0),
      activeUsers: Number(row.metricValues?.[1]?.value || 0),
      sessions: Number(row.metricValues?.[2]?.value || 0),
    }));
    const result = { status: "COLLECTED", collector: "GA4", collected_at: nowIso(now), window_days: windowDays, records };
    writeJson(stateFile(stateDir, "ga.json"), result);
    return result;
  } catch (error) {
    const result = { status: "GOOGLE_API_READ_FAILED", collector: "GA4", collected_at: nowIso(now), manual_import_available: true, error: error.message, records: [] };
    writeJson(stateFile(stateDir, "ga.json"), result);
    return result;
  }
}

async function main() {
  const requested = Number(flagValue("--days") || 7);
  const windowDays = requested === 28 ? 28 : 7;
  const result = await collectGa({ windowDays });
  console.log(`${result.status} MANUAL_IMPORT_AVAILABLE=${result.manual_import_available === true}`);
}

if (import.meta.main) main();
