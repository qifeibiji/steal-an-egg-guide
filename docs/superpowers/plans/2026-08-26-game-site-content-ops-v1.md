# Game Site Content Ops V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a monitor-only, human-gated content-operations loop without changing production website content.

**Architecture:** Native Node ES modules own deterministic configurations, source fingerprinting, CSV normalization, queue scoring, reports, validation, and orchestration. The collectors use the smallest official Google authentication library, but return a successful degraded status when credentials are unavailable. Local source and analytics state remains in ignored directories.

**Tech Stack:** Node 22 ESM, `node:test`, native `fetch`/`crypto`, `google-auth-library`, JSON/Markdown files, GitHub Actions.

---

### Task 1: Specify and protect the operations boundary

**Files:**
- Create: `docs/ops/GAME_SITE_CONTENT_OPS_V1.md`
- Modify: `.gitignore`

- [ ] Record the canonical monitor-only rules, human approval gate, credential requirements, degraded behavior, and stop conditions.
- [ ] Ignore `.ops-state/` and `.secrets/` so snapshots, imported analytics, and credentials cannot be committed.
- [ ] Verify: `git check-ignore .ops-state/example.json .secrets/google-service-account.json` returns both paths.

### Task 2: Establish failing fixture tests

**Files:**
- Create: `tests/ops.test.mjs`
- Test: `tests/ops.test.mjs`

- [ ] Add a source-scanner test whose first successful response asserts `BASELINE_ONLY` and `changed_since_last_check === false`.
- [ ] Run: `node --test tests/ops.test.mjs`; expected result: failure because `ops/scripts/source-scan.mjs` does not exist.
- [ ] Add a second fixture whose changed normalized body asserts a `SOURCE_RECHECK` candidate with source evidence.
- [ ] Add no-credential GSC/GA tests asserting a skipped/degraded response rather than an exception.

### Task 3: Implement configuration and source monitoring

**Files:**
- Create: `ops/config/sources.json`
- Create: `ops/config/pages.json`
- Create: `ops/config/ops.config.json`
- Create: `ops/scripts/ops-core.mjs`
- Create: `ops/scripts/source-scan.mjs`

- [ ] Register only the ten existing distinct source URLs, their existing target pages, update sensitivity, priority, and 2026-08-25 check date.
- [ ] Register exactly the locked eight production routes and their source IDs; list deferred topics only as backlog, never as routes.
- [ ] Implement `scanSources({ sources, previousState, fetcher, now, delay })` to return metadata and baseline/change states without storing article bodies.
- [ ] Make the CLI persist source state under `.ops-state/source-scan.json` and print one concise result per source.
- [ ] Run the fixture tests. Expected: baseline and fingerprint-change tests pass.

### Task 4: Implement data ingestion and deterministic queueing

**Files:**
- Create: `ops/scripts/google-client.mjs`
- Create: `ops/scripts/collect-gsc.mjs`
- Create: `ops/scripts/collect-ga.mjs`
- Create: `ops/scripts/import-gsc.mjs`
- Create: `ops/scripts/import-ga.mjs`
- Create: `ops/scripts/build-candidate-queue.mjs`

- [ ] Use `GoogleAuth` from `google-auth-library` only when the credential file and required environment variables exist; otherwise return `{ status: "GOOGLE_API_NOT_CONFIGURED", manual_import_available: true }`.
- [ ] Normalize the documented GSC/GA fields into ignored state files, supporting common case-insensitive CSV headings.
- [ ] Implement configurable positive-demand thresholds and stable mappings from registered query strings to existing pages.
- [ ] Emit only `UPDATE_EXISTING`, `NEW_PAGE_REVIEW`, `SOURCE_RECHECK`, or evidence-backed `NO_ACTION`, all with `PENDING_HUMAN_REVIEW` except `NO_ACTION`.
- [ ] Run: `node --test tests/ops.test.mjs`; expected: collector degradation and queue tests pass.

### Task 5: Report, validate, and orchestrate

**Files:**
- Create: `ops/scripts/build-ops-report.mjs`
- Create: `ops/scripts/validate-ops.mjs`
- Create: `ops/scripts/run-ops.mjs`
- Modify: `package.json`

- [ ] Generate a conclusion-first report with source, GSC, GA, candidate, credential, and recommended-human-action summaries.
- [ ] Validate tracked credentials, unknown routes, malformed/duplicate sources, evidence-free candidates, auto-approved new pages, `AUTO_PUBLISH`, and baseline-as-change errors.
- [ ] Run source scan -> GSC -> GA -> queue -> validator -> report; nonconfigured Google collectors remain a degraded pass but validator hard-gate failures exit nonzero.
- [ ] Add the exact `ops:*` package commands plus `ops:run`.

### Task 6: Automate monitoring without publishing

**Files:**
- Create: `.github/workflows/content-ops-monitor.yml`

- [ ] Schedule daily and allow `workflow_dispatch`.
- [ ] Cache ignored ops state, upload reports/queue as artifacts, and optionally materialize the GitHub secret credential only for that job.
- [ ] Create or update one marked GitHub Issue only when actionable candidates exist; never commit, edit site content, deploy, or open an issue for `NO_ACTION`.

### Task 7: Verify the user gates and integrate

**Files:**
- Test: `tests/ops.test.mjs`
- Test: all existing tests

- [ ] Run: `npm.cmd run ops:scan-sources`, `npm.cmd run ops:queue`, `npm.cmd run ops:validate`, `npm.cmd run ops:report`, and `npm.cmd run ops:run`.
- [ ] Confirm first scan is baseline-only, a fixture change becomes `SOURCE_RECHECK`, and missing credentials are a degraded pass.
- [ ] Run: `npm.cmd test` and `npm.cmd run build`.
- [ ] Inspect `git status --short`; stage only explicit ops/docs/workflow/package/.gitignore paths, never `deliverables/task-06-data-review.png`.
- [ ] Commit with `Ops: add game site content monitoring v1` and push `origin/main` after all checks succeed.
