---
phase: 01-data-foundation-and-security-baseline
plan: 03
subsystem: data-contracts
tags: [prisma, neon, qstash, redis, typescript, schema]
dependency_graph:
  requires: [01-01]
  provides: [prisma/schema.prisma, prisma.config.ts, src/lib/prisma.ts, src/lib/qstash.ts, src/lib/redis.ts, src/types/job.ts]
  affects: [01-04, 01-05, 01-06, 01-07, 01-08, all API routes, Edge Middleware]
tech_stack:
  added: []
  patterns:
    - Prisma 7 singleton with PrismaNeon adapter and globalForPrisma hot-reload guard
    - Prisma 7 prisma.config.ts datasource config pattern (DIRECT_URL for migrations, DATABASE_URL pooler for runtime)
    - Upstash QStash Client singleton for job queue publishing
    - Upstash Redis explicit constructor for Edge Middleware rate limiting
key_files:
  created:
    - prisma/schema.prisma
    - prisma.config.ts
    - src/types/job.ts
    - src/lib/prisma.ts
    - src/lib/qstash.ts
    - src/lib/redis.ts
  modified: []
decisions:
  - "CausalEdge.mechanism is non-nullable String (no ?) — schema-level enforcement per D-17; Prisma rejects any create without this field at the DB level"
  - "Prisma 7 import path is ../generated/prisma (NOT @prisma/client) — Pitfall 1 from RESEARCH.md; Plan 04 emits the client via prisma generate"
  - "DATABASE_URL uses pooler hostname (-pooler suffix, port 6543) for all runtime API calls; DIRECT_URL (port 5432) used only in prisma.config.ts for migrations"
  - "Redis client uses explicit constructor (not Redis.fromEnv()) to make env var names explicit and visible per D-07"
  - "src/types/job.ts is the single source of truth for JobStatus and API response shapes across all routes and UI components"
metrics:
  duration: "~10 minutes"
  completed_date: "2026-05-21"
  tasks_completed: 2
  files_created: 6
---

# Phase 1 Plan 3: Data Contracts and Library Singletons Summary

Prisma schema (Job/Result/Issue/CausalEdge) with JobStatus enum, Prisma 7 config using DIRECT_URL for migrations, and three library singletons (PrismaNeon adapter, QStash Client, Upstash Redis) that all subsequent API routes import.

---

## Tasks Completed

| Task | Name | Status | Commit |
|------|------|--------|--------|
| 1 | Write Prisma schema, prisma.config.ts, and src/types/job.ts | COMPLETE | 5ad96e0 |
| 2 | Write src/lib/prisma.ts, src/lib/qstash.ts, src/lib/redis.ts | COMPLETE | 7f7b322 |

---

## What Was Built

**prisma/schema.prisma** — Full Phase 1 data contract:
- `generator client` block: `provider = "prisma-client-js"`, `output = "../src/generated/prisma"` (Prisma 7 path)
- `datasource db` block: provider `postgresql` with no `url` field (Prisma 7 — url comes from prisma.config.ts)
- `enum JobStatus`: pending, crawling, extracting, analyzing, complete, failed (D-18)
- `model Job`: id (cuid), url, status (default: pending), error_message (nullable), created_at, updated_at, result, with indexes on status and created_at
- `model Result`: id (cuid), jobId (unique), job relation, narrative (Json), issues, edges, created_at
- `model Issue`: id, resultId, result relation, category, signal_source, severity (Int), raw_evidence, technical_description, causedBy/causes CausalEdge relations
- `model CausalEdge`: id, resultId, result relation, fromIssueId, fromIssue, toIssueId, toIssue, relationship, confidence, mechanism (NON-NULLABLE String, D-17), explanation

**prisma.config.ts** — Prisma 7 datasource config at project root using `defineConfig` from `prisma/config` with `env('DIRECT_URL')` for migrations.

**src/types/job.ts** — Shared TypeScript types:
- `JobStatus` union type (6 status values)
- `JobStatusResponse` interface for GET /api/jobs/[jobId]
- `AnalyzeResponse` interface for POST /api/analyze success
- `AnalyzeErrorResponse` interface for POST /api/analyze errors

**src/lib/prisma.ts** — Prisma singleton with:
- Import from `../generated/prisma` (Prisma 7 path, NOT `@prisma/client`)
- `PrismaNeon` adapter with `DATABASE_URL` (pooler URL)
- `globalForPrisma` hot-reload guard for Next.js development

**src/lib/qstash.ts** — QStash Client singleton using `QSTASH_TOKEN` for publishing jobs to the Railway crawler endpoint.

**src/lib/redis.ts** — Upstash Redis singleton using explicit constructor with `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for Edge Middleware rate limiting (D-07 separate database from QStash).

---

## Verification Results

- `npx prisma validate` (with DIRECT_URL placeholder): **The schema at prisma/schema.prisma is valid**
- `npm run typecheck`: exits 0 for all files EXCEPT the expected `Cannot find module '../generated/prisma'` error in src/lib/prisma.ts — this is documented as expected behavior; Plan 04 resolves it by running `prisma generate`/`db:push` which emits the client to `src/generated/prisma`
- All acceptance criteria verified:
  - `prisma/schema.prisma` contains `model CausalEdge`, `mechanism    String` (non-nullable), `output = "../src/generated/prisma"`, `enum JobStatus` with all 6 values
  - `prisma.config.ts` contains `defineConfig` and `env('DIRECT_URL')`
  - `src/types/job.ts` exports all 4 types
  - `prisma/schema.prisma` datasource block has NO `url` field
  - `src/lib/prisma.ts` imports from `../generated/prisma` and contains `PrismaNeon` and `DATABASE_URL`
  - `src/lib/qstash.ts` exports `qstash`, imports from `@upstash/qstash`
  - `src/lib/redis.ts` exports `redis`, imports from `@upstash/redis`, contains both Redis env var names

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

- `src/lib/prisma.ts` imports from `../generated/prisma` which does not yet exist. This file is generated by `prisma generate` / `prisma db push` in Plan 04. All TypeScript compilation and runtime imports will fail until Plan 04 runs. This is an intentional stub per the plan — Plan 04 resolves it.
- All three singletons require real credentials in `.env.local` (DATABASE_URL, QSTASH_TOKEN, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN) provisioned during Phase 1 Wave 1 human checkpoint. Using placeholder values will cause runtime failures.

---

## Threat Flags

No new threat surface beyond what is documented in the plan's threat model:
- DATABASE_URL accessed only in src/lib/prisma.ts (server-side, no NEXT_PUBLIC_ prefix) — T-01-06 mitigated
- QSTASH_TOKEN accessed only in src/lib/qstash.ts (server-side, no NEXT_PUBLIC_ prefix) — T-01-07 mitigated
- Redis credentials accessed only in src/lib/redis.ts (server-side) — T-01-08 mitigated
- CausalEdge.mechanism is non-nullable in schema — T-01-09 mitigated at schema level

---

## Self-Check

- [x] prisma/schema.prisma exists and contains all required models and enum
- [x] prisma.config.ts exists and contains defineConfig with env('DIRECT_URL')
- [x] src/types/job.ts exports all 4 required types
- [x] src/lib/prisma.ts imports from ../generated/prisma and uses PrismaNeon adapter
- [x] src/lib/qstash.ts exports qstash singleton
- [x] src/lib/redis.ts exports redis singleton with explicit env var constructor
- [x] Task 1 committed at 5ad96e0
- [x] Task 2 committed at 7f7b322
- [x] No STATE.md or ROADMAP.md modifications (orchestrator owns these)

## Self-Check: PASSED
