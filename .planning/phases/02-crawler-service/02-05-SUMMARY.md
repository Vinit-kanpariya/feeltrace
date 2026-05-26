---
phase: "02-crawler-service"
plan: "05"
subsystem: "crawler"
tags: ["processor", "job-lifecycle", "idempotency", "sla-timeout", "status-transitions", "browser-wiring"]
dependency_graph:
  requires:
    - phase: "02-02"
      provides: "crawler/src/processor.ts stub, server.ts queue integration"
    - phase: "02-03"
      provides: "browser.ts with DOM + CSS extractors"
    - phase: "02-04"
      provides: "js.ts and network.ts extractors"
  provides:
    - "crawler/src/processor.ts -- full processJob implementation with status transitions, idempotency, 55s SLA"
    - "crawler/src/browser.ts -- updated runDualViewportCrawl wiring all four extractors in correct order"
  affects:
    - "02-06 (end-to-end deployment checkpoint)"
tech_stack:
  added: []
  patterns:
    - "D-05 idempotency: job.status !== 'pending' check discards duplicate QStash deliveries"
    - "D-28 SLA: Promise.race wraps runDualViewportCrawl with 55s timeout"
    - "Status transitions: pending -> crawling -> extracting -> analyzing -> complete"
    - "Error path: catch sets status='failed' with error_message.slice(0, 500)"
    - "Coverage stop ordering: CSS coverage stops in extractCSSSignals, JS coverage stops in extractJSSignals, both before context.close()"
    - "HAR path unique per pass: /tmp/feeltrace-${jobId}-${mobile|desktop}.har"
key_files:
  created: []
  modified:
    - "crawler/src/processor.ts -- replaced no-op stub with full implementation"
    - "crawler/src/browser.ts -- added extractJSSignals + extractNetworkSignals imports and calls"
key_decisions:
  - "INFRA-03 compliance: signals held in-memory only; no DB writes for signal payloads"
  - "error_message.slice(0, 500): only message string stored, not stack trace (T-02-17)"
  - "SLA_MS = 55_000: 55s budget leaves 5s headroom from the 60s QStash job SLA (D-28)"
  - "jobId passed to runDualViewportCrawl for unique HAR file naming per pass"
patterns-established:
  - "processJob: idempotency check -> status transition -> Promise.race crawl -> in-memory signals -> status complete"
  - "crawlWithViewport final extraction order: DOM -> CSS (stopCSSCoverage) -> JS (stopJSCoverage) -> context.close() -> Network (read HAR)"
requirements-completed:
  - "CRAWL-02 (SPA hydration confirmed via full processor pipeline)"
  - "CRAWL-03 (dual viewport both complete and return to processJob)"
  - "SIG-01 through SIG-04 (all four signals collected in-memory)"

duration: "~30min"
completed: "2026-05-22"
---

# Phase 2 Plan 05: Wire Extractors + Implement Job Processor

**Full processor implementation (pending -> crawling -> extracting -> analyzing -> complete) with D-05 idempotency, D-28 55s SLA timeout, and browser.ts wired to call all four extractors in correct coverage-stop order**

## Performance

- **Duration:** ~30 min
- **Completed:** 2026-05-22
- **Tasks:** 2 (browser.ts wiring, processor.ts implementation)
- **Files modified:** 2

## Accomplishments

- `processJob(jobId, url)` replaces the no-op stub with full lifecycle: idempotency check, status transitions (5 states), 55s SLA via Promise.race, in-memory signal collection, error handling
- `runDualViewportCrawl` wired to call all four extractors in correct order: DOM, CSS (stops CSS coverage), JS (stops JS coverage), context.close() flushes HAR, then Network reads HAR
- Both mobile and desktop CrawlPass objects are fully populated with all four signal types
- SLA timeout rejects with descriptive error message caught by try/catch -> status='failed'

## Task Commits

| # | Commit | Type | Description |
|---|--------|------|-------------|
| 1 | e611ea0 | feat | wire all four extractors in browser.ts and implement job processor |

## Files Modified

- `crawler/src/processor.ts` -- full processJob: prisma idempotency check, status transitions, Promise.race SLA, in-memory signals, catch/failed path
- `crawler/src/browser.ts` -- added imports for extractJSSignals and extractNetworkSignals; crawlWithViewport now calls all four extractors in correct order; returns complete CrawlPass

## Decisions Made

- **jobId in HAR path**: `harPath = /tmp/feeltrace-${jobId ?? Date.now()}-${mobile|desktop}.har` -- unique per pass prevents race condition if two jobs run back-to-back and HAR files overlap
- **_signals variable**: Signals held as `const _signals = { mobile, desktop }` prefixed with underscore to signal intentional in-memory-only pattern (INFRA-03); Phase 3 will consume them
- **No processor unit tests**: Processor tests would require Prisma mock and Playwright mock; covered by end-to-end checkpoint in 02-06

## Deviations from Plan

None -- both tasks implemented as specified.

## Threat Mitigations Applied

| Threat ID | Status | Mitigation |
|-----------|--------|-----------|
| T-02-15 | Applied | D-05: job.status !== 'pending' discards duplicate deliveries |
| T-02-16 | Applied | D-28: 55s Promise.race rejects; catch sets status='failed' |
| T-02-17 | Applied | error_message.slice(0, 500) stores only message, not stack |
| T-02-18 | Applied | Signals are typed numbers/counts; no raw HTML passes through |
| T-02-SC | Applied | No new npm installs |

## Self-Check: PASSED

- [x] `crawler/src/processor.ts` -- exports processJob with all 5 status transitions
- [x] Idempotency: job.status !== 'pending' -> early return
- [x] SLA: Promise.race wraps runDualViewportCrawl with 55_000ms timeout
- [x] Error: catch sets status='failed', error_message.slice(0, 500)
- [x] `crawler/src/browser.ts` -- all four extractors called in correct order
- [x] TypeScript: PASS (0 errors in crawler/src excluding generated/prisma)

## Next Phase Readiness

- 02-06 human checkpoint: deploy to Railway, set env vars, verify end-to-end job lifecycle
- Phase 3 (AI pipeline) will replace the TODO stub in processJob with AI analysis calls
- All signal types populated; processJob is ready to receive the AI pipeline in Phase 3

---
*Phase: 02-crawler-service*
*Completed: 2026-05-22*
