# GAME_SITE_CONTENT_OPS_V1

## Goal

Run a lightweight, long-lived content-monitoring loop for [steal2eggs.wiki](https://www.steal2eggs.wiki): registered public sources and read-only search/analytics signals produce a deterministic review queue. Every content decision remains human-approved.

## Automation boundary

This system may fetch only URLs listed in `ops/config/sources.json`, collect read-only GSC/GA4 data, import locally supplied CSV files, write ignored local state, and generate review artifacts. It must not discover/crawl sites, bypass access controls, rewrite content, create production URLs, commit content changes, deploy, or auto-publish.

## Source monitor

- Sources are explicit, enabled, low-frequency records. Fetch failures are recorded without retry storms.
- Each scan records HTTP status, `checked_at`, `ETag`, `Last-Modified`, a normalized-content fingerprint, and error state in ignored `.ops-state/`.
- A source's first successful fingerprint is `BASELINE_ONLY`, never `SOURCE_CHANGED`. Only a later fingerprint difference emits a change signal.
- Third-party article bodies and snapshots are never committed.

## Data collectors

- GSC reads `sc-domain:steal2eggs.wiki` for 7 days by default (28 supported) with date, query, page, clicks, impressions, CTR, and position.
- GA4 reads the configured numeric property ID with date, page path, page views, active users, and sessions.
- API mode uses a service-account credential from `.secrets/google-service-account.json` or `GOOGLE_APPLICATION_CREDENTIALS`, with `GSC_SITE_URL` and `GA4_PROPERTY_ID` supplied by environment. A small official Google authentication dependency is preferred over fragile custom auth code.
- Missing credentials return `GOOGLE_API_NOT_CONFIGURED` and `MANUAL_IMPORT_AVAILABLE`; they do not block a degraded monitor run.
- `ops:import-gsc` and `ops:import-ga` accept ordinary exported CSVs and save normalized data only to `.ops-state/`.

## Candidate queue and human gate

- Allowed candidate types: `UPDATE_EXISTING`, `NEW_PAGE_REVIEW`, `SOURCE_RECHECK`, and `NO_ACTION`.
- A changed registered source creates `SOURCE_RECHECK`; mapped GSC demand creates `UPDATE_EXISTING`; qualifying unmapped GSC demand creates `NEW_PAGE_REVIEW`; no valid GSC signal creates `NO_ACTION`.
- Thresholds live only in `ops/config/ops.config.json`. Scores and output ordering are deterministic.
- All actionable candidates are `PENDING_HUMAN_REVIEW`. `NEW_PAGE_REVIEW` can never be pre-approved. `AUTO_PUBLISH` is invalid.
- The approved path is candidate -> evidence summary -> `HUMAN_APPROVED` -> a separate Codex drafting task -> validator -> human review -> merge/deploy.

## Publish gate

The ops tooling has no publishing capability. It does not modify existing articles, routes, metadata, GA/GSC setup, DNS, Vercel, Cloudflare, advertising, or visual design.

## Daily and weekly workflow

Daily: `npm run ops:run` runs source scan, configured collectors, candidate queue, validation, and short conclusion-first report. Weekly: a human reviews actionable candidates, validates only approved drafts in an independent task, then follows the normal human merge/deploy process.

## Credentials and state

`.ops-state/` and `.secrets/` are ignored. Credentials are never committed. GitHub Actions optionally reads `GOOGLE_SERVICE_ACCOUNT_JSON`, `GSC_SITE_URL`, and `GA4_PROPERTY_ID`; without them, source monitoring still passes and Google collection is explicitly skipped.

## Stop conditions

Stop and require human action for access/auth configuration, robots/login/anti-bot restrictions, unregistered sources, any production-content change request, or validator failure. A source fetch failure is reported as evidence, not treated as permission to invent a content change.
