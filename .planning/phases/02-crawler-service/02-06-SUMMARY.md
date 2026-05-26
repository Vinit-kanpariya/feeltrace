---
phase: "02-crawler-service"
plan: "06"
subsystem: "crawler"
tags: ["deployment", "ngrok", "prisma7", "qstash", "end-to-end", "human-checkpoint"]
dependency_graph:
  requires:
    - phase: "02-05"
      provides: "full processor, all four extractors wired"
  provides:
    - "Live crawler service verified end-to-end (pending -> crawling -> complete)"
    - "crawler/fly.toml — Fly.io deployment config (1 GB VM, always-on)"
    - "crawler/src/server.ts — RAILWAY_CRAWLER_URL used directly for signature verify"
    - "crawler/src/lib/prisma.ts — PrismaNeon adapter (Prisma 7 requirement)"
    - "crawler/package.json — postbuild copies Prisma generated client to dist/"
  affects:
    - "Phase 3 (AI pipeline) — signals proven to be collected in-memory"
tech_stack:
  added:
    - "@prisma/adapter-neon — Prisma 7 requires adapter for connection config (url removed from schema)"
    - "@neondatabase/serverless — peer dependency of @prisma/adapter-neon"
  patterns:
    - "postbuild: cpSync src/generated/prisma -> dist/generated/prisma (tsc does not copy .js/.wasm Prisma runtime files)"
    - "Prisma 7: url removed from schema datasource; connection via PrismaNeon({ connectionString }) in constructor"
    - "QStash signature verify URL: use RAILWAY_CRAWLER_URL directly (not CRAWLER_PUBLIC_URL + /crawl) to guarantee exact match"
    - "Local dev: node --env-file=.env dist/index.js + ngrok http <port>"
key_files:
  created:
    - "crawler/fly.toml — Fly.io deployment (1 GB, auto_stop off, /health check)"
  modified:
    - "crawler/src/server.ts — RAILWAY_CRAWLER_URL for verify URL (was CRAWLER_PUBLIC_URL + /crawl)"
    - "crawler/src/lib/prisma.ts — PrismaNeon adapter instead of bare PrismaClient()"
    - "crawler/package.json — postbuild copy step + @prisma/adapter-neon + @neondatabase/serverless"
    - "crawler/prisma/schema.prisma — datasource url field removed (Prisma 7 P1012 error)"
key_decisions:
  - "Fly.io over Railway — payment method required for Railway; Fly.io same Docker workflow at ~$5.70/mo"
  - "ngrok for local dev validation — free, no payment, perfect for 02-06 checkpoint"
  - "RAILWAY_CRAWLER_URL reused in crawler .env — same value both sides eliminates verify URL mismatch"
  - "PrismaNeon adapter — Prisma 7 removed url from schema entirely (error P1012); adapter pattern matches root project"
  - "postbuild cpSync — tsc compiles .ts to .js but does not copy Prisma-generated .js/.wasm runtime files"
patterns-established:
  - "Crawler local run: npm run build && node --env-file=.env dist/index.js"
  - "Verify QStash delivery: ngrok inspector at http://localhost:4040 shows request status"
requirements-completed:
  - "CRAWL-02 (SPA hydration confirmed on nextjs.org — job reaches complete)"
  - "CRAWL-03 (dual viewport confirmed — logs show mobile=mobile, desktop=desktop)"
  - "SIG-01 through SIG-04 (all four signals collected in-memory)"

duration: "~2 hours (including diagnosis and bug fixes)"
completed: "2026-05-26"
---

# Phase 2 Plan 06: Deployment + End-to-End Verification

**Crawler deployed locally via ngrok, end-to-end job lifecycle verified: pending -> crawling -> complete with dual viewport signal collection confirmed in logs and DB**

## Performance

- **Duration:** ~2 hours (including 4 bugs discovered and fixed during deployment)
- **Completed:** 2026-05-26
- **Files created:** 1 (fly.toml)
- **Files modified:** 4

## Accomplishments

- End-to-end flow verified: submitting `https://nextjs.org` via dashboard creates a job that transitions `pending -> crawling -> complete`
- Crawler logs confirm both mobile and desktop passes completing with signal collection
- DB confirms `job.status = complete` in Neon via Prisma Studio
- 4 deployment bugs discovered and fixed (all previously undetected in local TypeScript/test runs)

## Bugs Found and Fixed During Deployment

### Bug 1: Prisma generated client not copied to dist/
- **Symptom:** `Cannot find module '../generated/prisma'` on `node dist/index.js`
- **Root cause:** `tsc` compiles `.ts` files only; Prisma generates `.js`/`.wasm` runtime files into `src/generated/prisma` that are never copied to `dist/`
- **Fix:** Added `postbuild` script: `cpSync('src/generated/prisma', 'dist/generated/prisma', {recursive:true})`

### Bug 2: Prisma 7 removed url from schema datasource
- **Symptom:** `PrismaClientInitializationError: PrismaClient needs to be constructed with valid PrismaClientOptions`
- **Root cause:** Prisma 7 removed `url = env("DATABASE_URL")` from schema (error P1012 if added); connection must be passed via adapter in constructor
- **Fix:** Added `PrismaNeon({ connectionString: process.env.DATABASE_URL! })` adapter in `crawler/src/lib/prisma.ts` (matches root project pattern)
- **Packages added:** `@prisma/adapter-neon`, `@neondatabase/serverless`

### Bug 3: Port 3000 conflict with Next.js dev server
- **Symptom:** `EADDRINUSE: address already in use :::3000`
- **Root cause:** Next.js dev server occupies port 3000; crawler defaults to same port
- **Fix:** Set `PORT=3001` in `crawler/.env`

### Bug 4: QStash signature verification 401 (URL mismatch)
- **Symptom:** POST /crawl returning `{"error": "Invalid signature"}` 401 — visible in ngrok inspector
- **Root cause:** `CRAWLER_PUBLIC_URL + '/crawl'` in `receiver.verify()` did not exactly match the URL QStash delivered to; any trailing slash or encoding difference causes signature failure
- **Fix:** Changed verify URL to `process.env.RAILWAY_CRAWLER_URL!` directly — same env var used by Next.js to publish, guaranteed exact match

## Task Commits

| # | Commit | Description |
|---|--------|-------------|
| 1 | dc5c0ee | fly.toml + rename RAILWAY_PUBLIC_URL -> CRAWLER_PUBLIC_URL |
| 2 | 5fda35b | postbuild cpSync fix |
| 3 | 5529dcd | PrismaNeon adapter fix |
| 4 | e52cb3a | QStash signature verify URL fix |

## Verification Results

| Check | Result |
|---|---|
| GET /health | 200 {"status":"ok"} |
| POST /crawl (QStash delivery) | 200 (after Bug 4 fix) |
| Job status in Neon DB | complete |
| Crawler logs: mobile pass | confirmed |
| Crawler logs: desktop pass | confirmed |
| Completion time | under 60s |

## Threat Mitigations Applied

| Threat ID | Status | Note |
|-----------|--------|------|
| T-02-19 | Applied | RAILWAY_CRAWLER_URL exact match prevents all-401 scenario |
| T-02-20 | Applied | 1 GB RAM in fly.toml; p-queue concurrency:1 |
| T-02-21 | Applied | DATABASE_URL never logged |

## Self-Check: PASSED

- [x] GET /health returns 200
- [x] Job transitions pending -> crawling -> complete
- [x] Dual viewport confirmed in logs (mobile=mobile, desktop=desktop)
- [x] job.status = complete in Neon DB
- [x] Completion under 60s

---
*Phase: 02-crawler-service*
*Completed: 2026-05-26*
