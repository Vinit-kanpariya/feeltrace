---
phase: "02-crawler-service"
plan: "02"
subsystem: "crawler"
tags: ["hono", "qstash", "signature-verification", "p-queue", "http-server", "tdd", "railway"]
dependency_graph:
  requires:
    - phase: "02-01"
      provides: "crawler/ scaffold with package.json, tsconfig, types.ts, prisma.ts"
  provides:
    - "crawler/src/server.ts — Hono app with /health GET and /crawl POST routes"
    - "crawler/src/queue.ts — p-queue singleton (concurrency: 1, async-init via dynamic import)"
    - "crawler/src/index.ts — server entry point, initializes queue then binds Hono to PORT"
    - "crawler/src/processor.ts — processJob() stub placeholder (replaced in 02-05)"
    - "crawler/src/server.test.ts — 7 unit tests covering all route behaviors (100% pass)"
  affects:
    - "02-03 (processor.ts stub replaced by real crawl logic)"
    - "02-05 (processJob imported by queue.add call in server.ts)"
tech_stack:
  added:
    - "@hono/node-server@2.0.3 — Node.js adapter for Hono HTTP server (serve() function)"
  patterns:
    - "Raw body read with c.req.text() before JSON.parse() — required for QStash signature verification"
    - "p-queue v9 ESM-only loaded via dynamic import() in CommonJS module"
    - "Async startup pattern: await initQueue() then serve() in start() function"
    - "Immediate 200 response (D-04): enqueue job then return, never await job completion"
    - "Receiver.verify() URL must exactly match Railway public URL (T-02-07 threat mitigation)"
key_files:
  created:
    - "crawler/src/server.ts"
    - "crawler/src/queue.ts"
    - "crawler/src/index.ts"
    - "crawler/src/processor.ts"
    - "crawler/src/server.test.ts"
  modified:
    - "crawler/package.json — added @hono/node-server dependency"
    - "crawler/package-lock.json"
key_decisions:
  - "getQueue() async API instead of synchronous queue export — p-queue ESM dynamic import resolves asynchronously"
  - "initQueue() called in index.ts startup before serve() to ensure queue is ready before first /crawl request"
  - "processor.ts stub exported from its own file (not inlined in server.ts) — matches the 02-05 import path"
  - "Vitest mock uses class-based MockReceiver to satisfy 'new Receiver()' constructor pattern"
patterns-established:
  - "QStash endpoint pattern: read raw body first, check header, verify signature, parse+validate, enqueue, 200"
  - "p-queue singleton: module-level _queue variable, getQueue()/initQueue()/queue() API"
requirements-completed: []

duration: "12min"
completed: "2026-05-22"
---

# Phase 2 Plan 02: Hono Server + QStash Receiver + p-queue Entry Point

**Hono HTTP server with QStash HMAC signature verification (raw-body pattern), p-queue concurrency-1 singleton loaded via ESM dynamic import, and Railway-compatible entry point**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-05-22T12:38:00Z
- **Completed:** 2026-05-22T12:41:50Z
- **Tasks:** 2 (Task 1 TDD: 3 commits; Task 2: 1 commit)
- **Files created:** 5
- **Files modified:** 2 (package.json, package-lock.json)

## Accomplishments

- Hono server with `/health` (GET → 200) and `/crawl` (POST with QStash signature verification) routes
- QStash `Receiver.verify()` called on raw body string (`c.req.text()`) before any `JSON.parse()` — critical correctness constraint from RESEARCH.md Pitfall 3 and T-02-05
- p-queue singleton with `concurrency: 1` (D-23); ESM-only package loaded via `await import('p-queue')` inside CommonJS module
- Server entry point calls `await initQueue()` before `serve()` to ensure the queue is ready before Railway healthcheck passes
- All 7 TDD unit tests passing; TypeScript compilation clean across all crawler/src files

## Task Commits

| # | Commit | Type | Description |
|---|--------|------|-------------|
| 1 | 760a069 | test | RED: failing tests for all 7 Hono server behaviors |
| 2 | d55c21d | feat | GREEN: server.ts routes + processor.ts stub |
| 3 | eaf9052 | feat | queue.ts singleton + index.ts entry point |

## Files Created/Modified

- `crawler/src/server.ts` — Hono app: /health GET, /crawl POST with signature+payload validation; enqueues via getQueue()
- `crawler/src/queue.ts` — p-queue singleton: getQueue() (async init), queue() (sync accessor), initQueue() (startup hook)
- `crawler/src/index.ts` — async start(): initQueue() then serve({fetch: app.fetch, port: $PORT})
- `crawler/src/processor.ts` — processJob() no-op stub; real implementation in 02-05-PLAN.md
- `crawler/src/server.test.ts` — 7 unit tests: GET /health, POST /crawl (5 cases) including raw-body verification check
- `crawler/package.json` — added @hono/node-server@2.0.3 dependency
- `crawler/package-lock.json` — updated lock file

## Decisions Made

- **getQueue() not queue()** in server.ts: since the queue initializes asynchronously, the /crawl handler calls `await getQueue()` rather than the synchronous `queue()` accessor (which throws if called before init). This is safer for the first request edge case.
- **processor.ts as separate file**: the stub is exported from `crawler/src/processor.ts` rather than inlined in server.ts to match the import path that 02-05-PLAN.md will replace.
- **Vitest class-based mock for Receiver**: `vi.mock('@upstash/qstash', () => { class MockReceiver {...} })` needed because `vi.fn().mockImplementation()` factory doesn't satisfy `new Receiver()` constructor calls.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed @hono/node-server before implementing index.ts**
- **Found during:** Task 2 setup
- **Issue:** `@hono/node-server` required by the plan's index.ts pattern was not in crawler/package.json and not installed
- **Fix:** Ran `sfw npm install @hono/node-server` in crawler/ directory (CLAUDE.md security requirement)
- **Files modified:** crawler/package.json, crawler/package-lock.json
- **Verification:** `import { serve } from '@hono/node-server'` resolves; TypeScript compilation passes
- **Committed in:** eaf9052 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed Vitest mock for QStash Receiver constructor**
- **Found during:** Task 1 TDD GREEN phase
- **Issue:** `vi.fn().mockImplementation(() => ({ verify: mockVerify }))` returned a plain function factory, not a constructible class. TypeScript/Vitest saw `() => ...` as not a constructor, causing `TypeError: () => ({...}) is not a constructor`
- **Fix:** Replaced with `class MockReceiver { verify = mockVerify; constructor() {...} }` inside the mock factory
- **Files modified:** crawler/src/server.test.ts
- **Verification:** All 7 tests pass after fix
- **Committed in:** d55c21d (GREEN phase commit)

---

**Total deviations:** 2 auto-fixed (1 blocking install, 1 test mock bug)
**Impact on plan:** Both fixes were necessary for implementation to proceed. No scope creep.

## Threat Mitigations Applied

| Threat ID | Status | Mitigation |
|-----------|--------|-----------|
| T-02-04 | Applied | `Receiver.verify()` called on every /crawl POST; 401 for missing/invalid signature |
| T-02-05 | Applied | `c.req.text()` reads raw body before `JSON.parse()` — signature verified on wire bytes |
| T-02-06 | Applied | p-queue concurrency:1 prevents unbounded job accumulation |
| T-02-07 | Documented | `RAILWAY_PUBLIC_URL + '/crawl'` passed to verify(); mismatch causes all deliveries to fail — documented in env var table |
| T-02-SC | Applied | `@hono/node-server` installed via `sfw npm install`; honojs official package |

## Known Stubs

- `crawler/src/processor.ts` — `processJob()` is a no-op stub that logs to console. The real Playwright-based implementation is wired in 02-05-PLAN.md. This stub does not affect the server's correctness for 02-02's scope (server returns 200 immediately and the queue adds the job).

## Self-Check: PASSED

Files created verified to exist:
- [x] `crawler/src/server.ts` — FOUND
- [x] `crawler/src/queue.ts` — FOUND
- [x] `crawler/src/index.ts` — FOUND
- [x] `crawler/src/processor.ts` — FOUND
- [x] `crawler/src/server.test.ts` — FOUND

Commits verified:
- [x] 760a069 — test(02-02): add failing tests for Hono server routes
- [x] d55c21d — feat(02-02): implement Hono server with /health and /crawl routes
- [x] eaf9052 — feat(02-02): add p-queue singleton and server entry point

TypeScript: PASS (0 errors in crawler/src)
Tests: 7/7 PASS

## Next Phase Readiness

- Plan 02-03 can now implement `processJob()` in `processor.ts` with real Playwright crawl logic
- The /crawl endpoint is ready to receive QStash deliveries once Railway env vars are set
- The queue singleton is initialized at startup — no race conditions between startup and first delivery
- Blockers: none — Railway deployment requires env vars (QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY, RAILWAY_PUBLIC_URL, DATABASE_URL) set in Railway dashboard

---
*Phase: 02-crawler-service*
*Completed: 2026-05-22*
