---
phase: 08-multi-page-crawl
plan: "01"
subsystem: schema + types
tags: [prisma, schema, typescript, types, migration, phase8]
dependency_graph:
  requires: []
  provides:
    - CrawledPage, CrawledPageIssue, CrawledPageEdge Prisma models
    - Result.crawledPages relation and Result.cross_page_patterns column
    - PipelineResult, PageAnalysisResult, CrossPagePattern, SiteWideNarrative TypeScript interfaces
    - CrawlPass.internalLinks optional field
  affects:
    - crawler/src/pipeline/run-pipeline.ts (will consume PipelineResult)
    - crawler/src/pipeline/site-wide-merger.ts (will consume PageAnalysisResult, SiteWideNarrative, CrossPagePattern)
    - crawler/src/processor.ts (will write CrawledPage rows via Prisma)
    - crawler/src/browser.ts (will populate CrawlPass.internalLinks)
tech_stack:
  added: []
  patterns:
    - Prisma 7 schema sync pattern (root schema -> crawler schema, no url field in datasource)
    - import type to avoid circular runtime dependencies in pipeline/types.ts
    - Baseline migration pattern for first-time prisma migrate setup on existing DB
key_files:
  created:
    - prisma/migrations/20260101000000_baseline/migration.sql
    - prisma/migrations/20260529062857_phase8_crawled_page/migration.sql
    - prisma/migrations/migration_lock.toml
  modified:
    - prisma/schema.prisma
    - crawler/prisma/schema.prisma
    - crawler/src/pipeline/types.ts
    - crawler/src/lib/types.ts
    - crawler/src/generated/prisma/ (regenerated client)
decisions:
  - "Removed url field from crawler/prisma/schema.prisma datasource — Prisma 7 removed url from schema datasource; runtime connection uses PrismaNeon adapter with DATABASE_URL passed in crawler/src/lib/prisma.ts"
  - "Created baseline migration (20260101000000_baseline) to establish migration tracking for existing DB — prisma/migrations/ did not exist; used prisma migrate resolve --applied to mark it without re-running destructive SQL"
  - "Used import type for TechProfile and PageType in pipeline/types.ts to avoid circular runtime dependencies"
metrics:
  duration: "~15 minutes"
  completed: "2026-05-29"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 7
---

# Phase 8 Plan 01: Schema Foundation and Type Contracts Summary

Established Phase 8 type contracts and database schema: three new CrawledPage models in Prisma, Result model extended with crawledPages relation and cross_page_patterns column, named migration created and applied to Neon DB, and four TypeScript interfaces added to crawler pipeline types.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend Prisma schemas with CrawledPage models and run migration | 97750b7 | prisma/schema.prisma, crawler/prisma/schema.prisma, prisma/migrations/, crawler/src/generated/ |
| 2 | Add Phase 8 type contracts to crawler/src/pipeline/types.ts and crawler/src/lib/types.ts | 4828318 | crawler/src/pipeline/types.ts, crawler/src/lib/types.ts |

## What Was Built

**Schema changes (Task 1):**
- `CrawledPage` model: id, resultId (FK→Result), url, page_index, narrative Json, screenshot_url, tech_stack, issues CrawledPageIssue[], edges CrawledPageEdge[], created_at; index on resultId
- `CrawledPageIssue` model: mirrors Issue model layout; causedBy/causes relations using named "ToCrawledPageIssue"/"FromCrawledPageIssue" relation names
- `CrawledPageEdge` model: mirrors CausalEdge model; mechanism is NON-NULLABLE (T-08-01 mitigation); fromIssue/toIssue FK relations to CrawledPageIssue
- `Result.crawledPages CrawledPage[]`: backward-compatible relation (no column on Result itself)
- `Result.cross_page_patterns Json?`: nullable JSON column for CrossPagePattern[] array (T-08-02: internal write only)

**Migration (Task 1):**
- Baseline migration `20260101000000_baseline` created and marked applied (prisma migrate resolve --applied) to establish migration tracking for DB that was initialized via db:push with no history
- New migration `20260529062857_phase8_crawled_page` created and applied to Neon DB; SQL contains ALTER TABLE Result, CREATE TABLE CrawledPage/CrawledPageIssue/CrawledPageEdge, CREATE INDEX, and five ADD FOREIGN KEY statements

**Type contracts (Task 2):**
- `PipelineResult`: enrichedIssues, edges, narrative, screenshotUrl, techProfile, pageType — consumed by run-pipeline.ts
- `PageAnalysisResult`: url, pageIndex, enrichedIssues, edges, narrative, screenshotUrl, techProfile, pageType, discoveredLinks — consumed by site-wide-merger.ts
- `CrossPagePattern`: signal_source, page_count, worst_severity, affected_urls, representative_evidence
- `SiteWideNarrative`: narrative NarrativeResult, crossPagePatterns CrossPagePattern[]
- `CrawlPass.internalLinks?: string[]`: optional field for Phase 8 desktop pass link discovery

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed url field from crawler/prisma/schema.prisma datasource**
- **Found during:** Task 1 — npx prisma generate in crawler/ failed with P1012: "url is no longer supported in schema files"
- **Issue:** The plan specified to preserve `url = env("DATABASE_URL")` in the crawler schema datasource, but Prisma 7 removed support for the url field in schema datasource blocks entirely. The root schema already omitted it; the crawler schema had a stale pattern.
- **Fix:** Removed `url = env("DATABASE_URL")` from crawler/prisma/schema.prisma datasource. Runtime connection is handled by PrismaNeon adapter in crawler/src/lib/prisma.ts (passes DATABASE_URL to adapter constructor). The comment in the file header was updated to document this.
- **Files modified:** crawler/prisma/schema.prisma
- **Commit:** 97750b7

**2. [Rule 3 - Blocker] Created baseline migration to unblock prisma migrate dev**
- **Found during:** Task 1 — npm run db:migrate failed with "Drift detected: Your database schema is not in sync with your migration history" because prisma/migrations/ did not exist
- **Issue:** The DB had all tables (Job, Result, Issue, CausalEdge) but no migration history — the project was initialized via db:push without ever running db:migrate. Running prisma migrate dev wanted to reset the DB (destroying all data) to resolve the drift.
- **Fix:** Generated baseline SQL via `prisma migrate diff --from-empty --to-config-datasource --script`, wrote it to `prisma/migrations/20260101000000_baseline/migration.sql`, then ran `prisma migrate resolve --applied 20260101000000_baseline` to register it without re-running the SQL. Then `prisma migrate dev --name phase8_crawled_page` succeeded cleanly.
- **Files modified:** prisma/migrations/20260101000000_baseline/migration.sql (new), prisma/migrations/migration_lock.toml (new)
- **Commit:** 97750b7

## Verification Results

1. prisma/schema.prisma contains exactly 1 `model CrawledPage`, 1 `model CrawledPageIssue`, 1 `model CrawledPageEdge` — PASS
2. prisma/schema.prisma contains `cross_page_patterns Json?` on Result model — PASS
3. prisma/schema.prisma contains `crawledPages   CrawledPage[]` on Result model — PASS
4. crawler/prisma/schema.prisma contains identical new models; generator output is `"../src/generated/prisma"`; datasource has no url (Prisma 7 compat, connection via adapter) — PASS
5. prisma/migrations/ contains `20260529062857_phase8_crawled_page` directory with migration.sql containing CREATE TABLE statements for all three models — PASS
6. Migration applied to Neon DB successfully (prisma migrate dev exited 0) — PASS
7. npx prisma generate exited 0 in root — PASS
8. npx prisma generate exited 0 in crawler/ — PASS
9. crawler/src/pipeline/types.ts exports PipelineResult, PageAnalysisResult, CrossPagePattern, SiteWideNarrative — PASS
10. CrawlPass.internalLinks?: string[] added to crawler/src/lib/types.ts — PASS
11. npx tsc --noEmit in crawler/ exits 0 — PASS

## Threat Model Compliance

| Threat | Mitigation Applied |
|--------|-------------------|
| T-08-01: CrawledPageEdge.mechanism tampering | mechanism field is NON-NULLABLE (no @default) — mirrors CausalEdge.mechanism enforcement (D-17) |
| T-08-02: Result.cross_page_patterns injection | Json? nullable column; written only by internal crawler pipeline |
| T-08-03: db:migrate DoS risk | Migration adds new tables/columns only; no destructive operations on existing rows |

## Known Stubs

None — this plan delivers schema and type definitions only; no data-wiring stubs.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or unexpected schema changes introduced beyond what is documented in the plan's threat model.

## Self-Check: PASSED

- prisma/schema.prisma: FOUND (model CrawledPage at line 81)
- crawler/prisma/schema.prisma: FOUND (model CrawledPage at line 82)
- prisma/migrations/20260529062857_phase8_crawled_page/migration.sql: FOUND
- crawler/src/pipeline/types.ts: FOUND (PipelineResult at line 73)
- crawler/src/lib/types.ts: FOUND (internalLinks at line 114)
- Commits 97750b7 and 4828318: FOUND in git log
