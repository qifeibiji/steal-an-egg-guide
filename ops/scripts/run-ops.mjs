import { buildCandidateQueue, writeCandidateQueue } from "./build-candidate-queue.mjs";
import { buildOpsReport, writeOpsReport } from "./build-ops-report.mjs";
import { collectGa } from "./collect-ga.mjs";
import { googleApiAvailability } from "./google-client.mjs";
import { collectGsc } from "./collect-gsc.mjs";
import { defaultStateDir, readConfig, readJson, reportFile, stateFile, writeJson } from "./ops-core.mjs";
import { scanSources, sourceFetchOptions } from "./source-scan.mjs";
import { validateOps } from "./validate-ops.mjs";

export async function collectWithManualFallback({ stateDir = defaultStateDir, fileName, apiAvailable = false, collector }) {
  const existing = readJson(stateFile(stateDir, fileName), null);
  if (!apiAvailable && existing?.status === "MANUAL_IMPORT" && Array.isArray(existing.records)) return existing;
  return collector({ stateDir });
}

async function main() {
  const sources = readConfig("sources.json");
  const pageRegistry = readConfig("pages.json");
  const config = readConfig("ops.config.json");
  const sourceStatePath = stateFile(defaultStateDir, "source-scan.json");
  const previousSourceState = readJson(sourceStatePath, { sources: {} });
  const sourceState = await scanSources({
    sources,
    previousState: previousSourceState,
    minRequestDelay: config.source_monitor.min_request_delay_ms,
    fetcher: (url) => fetch(url, sourceFetchOptions(config.source_monitor)),
  });
  writeJson(sourceStatePath, sourceState);
  const [gscState, gaState] = await Promise.all([
    collectWithManualFallback({ fileName: "gsc.json", apiAvailable: googleApiAvailability().configured, collector: collectGsc }),
    collectWithManualFallback({ fileName: "ga.json", apiAvailable: googleApiAvailability({ requireGaProperty: true }).configured, collector: collectGa }),
  ]);
  const queue = buildCandidateQueue({ pages: pageRegistry.pages, sourceState, gscState, config: config.queue });
  writeCandidateQueue(queue);
  const productionPages = readJson(new URL("../../content/site-pages.json", import.meta.url), []);
  const validation = validateOps({ sources, pageRegistry, sourceState, queue, productionRoutes: new Set(productionPages.map((page) => page.path)) });
  writeJson(reportFile("validation.json"), validation);
  const report = buildOpsReport({ sourceState, gscState, gaState, queue, validation });
  writeOpsReport(report);
  console.log(validation.valid ? `OPS_RUN_PASS ${report.conclusion}` : `OPS_RUN_FAIL ${validation.errors.join(" | ")}`);
  if (!validation.valid) process.exitCode = 1;
}

if (import.meta.main) main().catch((error) => { console.error(`OPS_RUN_FAIL ${error.message}`); process.exitCode = 1; });
