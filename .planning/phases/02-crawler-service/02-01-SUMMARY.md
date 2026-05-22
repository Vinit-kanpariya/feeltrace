---
phase: "02-crawler-service"
plan: "01"
subsystem: "crawler"
tags: ["scaffold", "docker", "railway", "prisma", "typescript", "signal-types"]
dependency_graph:
  requires: []
  provides:
    - "crawler/ sub-project scaffold (buildable, installable)"
    - "crawler/src/lib/types.ts — canonical signal type contracts for all four extractors"
    - "crawler/src/lib/prisma.ts — standard PrismaClient singleton for DB writes"
    - "crawler/prisma/schema.prisma — schema copy for prisma generate in Docker build"
    - "crawler/Dockerfile — Railway-compatible Docker image definition"
    - "crawler/railway.toml — Railway deployment config with healthcheck and build command"
  affects: []
tech_stack:
  added:
    - "playwright-core@1.60.0 — headless Chromium crawling"
    - "hono@4.12.21 — Railway HTTP server framework"
    - "@upstash/qstash@2.11.0 — QStash Receiver signature verification"
    - "@prisma/client@7.8.0 — standard PrismaClient for Neon TCP connection"
    - "p-queue@9.3.0 — in-memory sequential job queue (concurrency: 1)"
    - "zod@4.4.3 — QStash payload validation"
    - "typescript@6.0.3 — compiler for the crawler sub-project"
  patterns:
    - "crawler/ is a completely standalone Node.js project — no shared node_modules with root Next.js app"
    - "commonjs module system (not ESM) for Node.js 22 compatibility"
    - "PrismaClient singleton via global hot-reload guard pattern"
    - "Docker USER pwuser to preserve Chromium sandbox without --no-sandbox"
key_files:
  created:
    - "crawler/package.json"
    - "crawler/package-lock.json"
    - "crawler/tsconfig.json"
    - "crawler/.gitignore"
    - "crawler/.dockerignore"
    - "crawler/src/index.ts"
    - "crawler/src/lib/types.ts"
    - "crawler/src/lib/prisma.ts"
    - "crawler/prisma/schema.prisma"
    - "crawler/Dockerfile"
    - "crawler/railway.toml"
  modified: []
decisions:
  - "types.ts is the single source of truth for signal shapes — all extractors and the Phase 3 pipeline import from here; never redeclare interfaces in extractor files"
  - "tsconfig.json requires types:[node] (not just lib:[ES2022]) to resolve console/global/process in strict mode — omitting this causes TS2584/TS2304/TS2591 errors"
  - "crawler/prisma/schema.prisma adds url=env(DATABASE_URL) because the crawler has no prisma.config.ts; root schema omits url because Prisma 7 reads it via prisma.config.ts"
metrics:
  duration: "5m"
  completed_date: "2026-05-22"
  tasks_completed: 3
  tasks_total: 3
  files_created: 11
  files_modified: 0
---

# Phase 2 Plan 01: Crawler Sub-Project Scaffold Summary

**One-liner:** Standalone Node.js crawler sub-project with pinned Playwright/Hono/Prisma dependencies, signal type contracts, standard PrismaClient, Playwright Docker image config, and Railway deployment config.

## What Was Built

A complete scaffold for the `crawler/` sub-project — the foundation every subsequent plan (02-02 through 02-05) builds on. No application logic is written here; only the skeleton that makes the rest independently buildable and deployable.

### Task 1: npm project + TypeScript config
- `crawler/package.json` — standalone `feeltrace-crawler` project with 6 runtime deps at exact pinned versions (no caret) per RESEARCH.md Open Question 2
- `crawler/tsconfig.json` — ES2022/commonjs target, strict mode, `types:["node"]` to expose Node.js globals
- All packages installed via `sfw npm install` (CLAUDE.md security requirement; all packages confirmed [OK] in RESEARCH.md Package Legitimacy Audit)

### Task 2: Signal type contracts + Prisma client + schema copy
- `crawler/src/lib/types.ts` — exports all 6 canonical interfaces (DOMSignals, CSSSignals, JSSignals, HAREntry, NetworkSignals, CrawlPass) verbatim from 02-CONTEXT.md; single source of truth
- `crawler/src/lib/prisma.ts` — standard `new PrismaClient()` singleton (no `@prisma/adapter-neon`); imports from `../generated/prisma` (created at Docker build time via `prisma generate`)
- `crawler/prisma/schema.prisma` — exact copy of root schema with `output = "../src/generated/prisma"` and `url = env("DATABASE_URL")` for standalone `prisma generate`

### Task 3: Dockerfile + railway.toml
- `crawler/Dockerfile` — base `mcr.microsoft.com/playwright/node:v1.60.0-noble` (pinned, never :latest); `USER pwuser` preserves Chromium sandbox; `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright`; no `--no-sandbox` flag (T-02-02 mitigation)
- `crawler/railway.toml` — `healthcheckPath = "/health"`, `healthcheckTimeout = 60`, `ON_FAILURE` restart; `buildCommand = "npm ci && npx prisma generate && npm run build"` for Docker-time Prisma client generation
- `crawler/.dockerignore` — excludes node_modules, dist, .git, docs, test files

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed missing `types:["node"]` in tsconfig.json**
- **Found during:** Task 2 TypeScript verification
- **Issue:** `crawler/tsconfig.json` had `"lib": ["ES2022"]` but no `"types": ["node"]` entry. TypeScript strict mode in a Node.js project without Node.js type references causes `TS2584: Cannot find name 'console'`, `TS2304: Cannot find name 'global'`, and `TS2591: Cannot find name 'process'`
- **Fix:** Added `"types": ["node"]` to `compilerOptions` in `crawler/tsconfig.json`
- **Files modified:** `crawler/tsconfig.json`
- **Commit:** 401b057

## Threat Mitigations Applied

| Threat ID | Mitigation Applied |
|-----------|-------------------|
| T-02-01 | Dockerfile pins to `v1.60.0-noble` exact tag |
| T-02-02 | `USER pwuser` in Dockerfile; no `--no-sandbox` in any launch args |
| T-02-03 | `DATABASE_URL` not in Dockerfile; set only as Railway env var; `.dockerignore` excludes `.env*` |
| T-02-SC | All packages installed via `sfw npm install`; Package Legitimacy Audit confirmed all [OK] |

## Known Stubs

None — this plan creates only type definitions, configuration, and a minimal placeholder `src/index.ts`. No data flows or UI rendering paths are involved.

## Self-Check: PASSED

Files created verified to exist:
- [x] `crawler/package.json` — FOUND
- [x] `crawler/tsconfig.json` — FOUND
- [x] `crawler/src/lib/types.ts` — FOUND
- [x] `crawler/src/lib/prisma.ts` — FOUND
- [x] `crawler/prisma/schema.prisma` — FOUND
- [x] `crawler/Dockerfile` — FOUND
- [x] `crawler/railway.toml` — FOUND

Commits verified:
- [x] 2555afb — chore(02-01): initialize crawler/ sub-project with npm packages and TypeScript config
- [x] 401b057 — feat(02-01): add signal type contracts, Prisma client singleton, and schema copy
- [x] 478b241 — feat(02-01): add Dockerfile and railway.toml for Railway deployment
