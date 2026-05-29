---
phase: 08-multi-page-crawl
plan: "06"
subsystem: dashboard ui
tags: [react, client-component, accordion, crawledpages, phase8, crawl-03]
dependency_graph:
  requires:
    - phase: 08-01
      provides: CrawledPage, CrawledPageIssue Prisma models; Result.crawledPages relation; Result.cross_page_patterns column
    - phase: 08-05
      provides: writeCrawlResults output shape; CrawledPage DB rows with nested issues and edges
  provides:
    - PageAccordionSection Client Component (accordion toggle + NarrativeSection + IssueCard list per page)
    - results page crawledPages Prisma query include (orderBy page_index asc, nested issues + edges)
    - Section 7a cross_page_patterns block (conditional, non-empty array guard)
    - Section 7b per-page accordion (conditional, crawledPages.length > 0 guard)
  affects:
    - src/app/results/[jobId]/page.tsx (extended with new sections)
    - src/components/PageAccordionSection.tsx (created)
tech_stack:
  added: []
  patterns:
    - "'use client' on line 1 for Client Component accordion (useState toggle)"
    - "Double-cast (as unknown as NarrativeResult) for Prisma Json column — project-standard pattern"
    - "defaultOpen={page.page_index === 0} to open root page by default"
    - "Array.isArray guard before rendering cross_page_patterns Json? column"
    - "Backward-compat guard: crawledPages.length > 0 hides accordion for historical jobs"
key_files:
  created:
    - src/components/PageAccordionSection.tsx
  modified:
    - src/app/results/[jobId]/page.tsx
decisions:
  - "Rendered page URL as JSX text in span (not href) per T-08-17 — React auto-escapes HTML entities"
  - "CrawledPageIssue fields (fix_suggestion, severity_justification) are non-nullable strings in schema — typed as string (not string?) to match IssueCard's optional props (IssueCard accepts optional, component passes string)"
  - "cross_page_patterns rendered with Array.isArray + length > 0 double-guard to handle both null and empty-array cases from Prisma Json? column"
metrics:
  duration: "~10 minutes"
  completed: "2026-05-29"
  tasks_completed: 2
  tasks_total: 3
  files_modified: 2
---

# Phase 8 Plan 06: Per-Page Accordion UI Summary

Per-page accordion UI added to results page: PageAccordionSection Client Component renders accordion toggle with NarrativeSection and IssueCard list per crawled page; results page Prisma query extended with crawledPages include; Section 7a shows cross-page patterns; Section 7b shows per-page breakdown with root page open by default.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create PageAccordionSection.tsx Client Component | 3405c9f | src/components/PageAccordionSection.tsx |
| 2 | Extend results page Prisma query and render per-page accordion + cross-page patterns | a6c3c9c | src/app/results/[jobId]/page.tsx |

## What Was Built

**PageAccordionSection.tsx (Task 1):**
- `'use client'` on line 1 (before all imports)
- `useState(defaultOpen)` for accordion open/close toggle
- Renders a `button` header showing the page URL as monospace text (XSS-safe JSX text child, T-08-17)
- Open chevron / closed chevron SVG indicator on right side
- Conditionally renders when `isOpen`: `NarrativeSection` with `narrative` cast via `as unknown as NarrativeResult`, followed by `page.issues.map(issue => IssueCard)` or "No issues detected on this page." fallback
- Named export `PageAccordionSection`; accepts `page` and optional `defaultOpen` props

**results/[jobId]/page.tsx (Task 2):**
- Added `import { PageAccordionSection } from '@/components/PageAccordionSection'`
- Extended Prisma `findUnique` include: `crawledPages: { orderBy: { page_index: 'asc' }, include: { issues: { orderBy: { severity: 'desc' } }, edges: true } }`
- Section 7a: renders "Site-wide Patterns" block when `result.cross_page_patterns != null && Array.isArray(...) && length > 0`; each pattern shown as `signal_source` badge + "detected on N pages" text
- Section 7b: renders "Per-page Breakdown" section when `result.crawledPages.length > 0`; maps to `PageAccordionSection` with `defaultOpen={page.page_index === 0}`
- Historical jobs (pre-Phase-8, crawledPages=[]) render identically to Phase 7 — no accordion rendered

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

1. `npm run typecheck` exits 0 — PASS
2. `PageAccordionSection.tsx` line 1 is `'use client'` — PASS
3. `grep -n "crawledPages|PageAccordionSection|cross_page_patterns"` returns 8 lines in page.tsx — PASS
4. `npm test -- src/app/results`: 2/2 CRAWL-03 tests GREEN — PASS

## Threat Model Compliance

| Threat | Mitigation Applied |
|--------|-------------------|
| T-08-16: XSS via fix_suggestion / severity_justification | Rendered as IssueCard JSX text children (not dangerouslySetInnerHTML) — React auto-escapes |
| T-08-17: XSS via page URL in accordion header | Rendered as JSX text in span element (not href attribute); React escapes HTML entities in text |
| T-08-18: Information disclosure via cross_page_patterns | Accepted — FeelTrace shareable-link model; no PII in pattern data |
| T-08-19: NarrativeResult JSON cast | Double-cast (as unknown as NarrativeResult) — project-standard pattern; data written by internal pipeline |

## Known Stubs

None — PageAccordionSection and results page extension are fully wired to live Prisma data. No hardcoded empty values, placeholder text, or disconnected data flows.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes introduced beyond the plan's threat model.

## Checkpoint Required

**Type:** human-verify
**Status:** Awaiting human verification at visual checkpoint

The following human verification is required before this plan can be marked complete:
1. Submit a multi-page URL at `/` and wait for completion
2. Open `/results/[jobId]` and verify:
   - Site-wide narrative section renders at top (unchanged)
   - "Site-wide Patterns" block appears if cross-page patterns were detected
   - "Per-page Breakdown" section shows page count
   - Root page accordion is OPEN by default; additional pages CLOSED
   - Clicking closed pages opens them revealing NarrativeSection and IssueCard list
3. Open an old single-URL job `/results/[jobId]` and verify identical rendering to Phase 7 (no accordion)

## Self-Check: PASSED

- src/components/PageAccordionSection.tsx: FOUND — 'use client' at line 1, useState at line 30, named export at line 28
- src/app/results/[jobId]/page.tsx: FOUND — PageAccordionSection import at line 21, crawledPages include at line 65, accordion render at line 269
- Commit 3405c9f: FOUND in git log
- Commit a6c3c9c: FOUND in git log
- npm run typecheck exits 0: VERIFIED
- 2/2 CRAWL-03 tests GREEN: VERIFIED
