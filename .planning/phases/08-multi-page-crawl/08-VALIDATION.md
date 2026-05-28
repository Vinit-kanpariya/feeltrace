---
phase: 8
slug: multi-page-crawl
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-28
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `crawler/vitest.config.ts` |
| **Quick run command** | `npm test -- --reporter=dot crawler/src/pipeline/site-wide-merger.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick test on the specific file modified
- **After every plan wave:** Run `npm test` (full suite — currently 196 tests)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|-------------|--------|
| extractInternalLinks filtering | schema | 0 | CRAWL-01 | Only same-origin, non-mailto, non-fragment links returned | unit | `npm test -- crawler/src/browser.test.ts` | ❌ W0 | ⬜ pending |
| extractInternalLinks dedup | schema | 0 | CRAWL-01 | Set-deduplicated links (no duplicates) | unit | `npm test -- crawler/src/browser.test.ts` | ❌ W0 | ⬜ pending |
| extractInternalLinks root exclusion | schema | 0 | CRAWL-01 | Root URL excluded from discovered links | unit | `npm test -- crawler/src/browser.test.ts` | ❌ W0 | ⬜ pending |
| detectCrossPagePatterns threshold | pipeline | 0 | CRAWL-02 | Patterns returned only for signal_source on ≥3 pages | unit | `npm test -- crawler/src/pipeline/site-wide-merger.test.ts` | ❌ W0 | ⬜ pending |
| detectCrossPagePatterns empty | pipeline | 0 | CRAWL-02 | Empty array when no signal_source meets threshold | unit | `npm test -- crawler/src/pipeline/site-wide-merger.test.ts` | ❌ W0 | ⬜ pending |
| detectCrossPagePatterns sort | pipeline | 0 | CRAWL-02 | Sorted by worst_severity descending | unit | `npm test -- crawler/src/pipeline/site-wide-merger.test.ts` | ❌ W0 | ⬜ pending |
| runSiteWideAnalysis output shape | pipeline | 0 | CRAWL-02 | Returns SiteWideNarrative with required fields | unit (mock Groq) | `npm test -- crawler/src/pipeline/site-wide-merger.test.ts` | ❌ W0 | ⬜ pending |
| Results page accordion | UI | 0 | CRAWL-03 | Accordion renders when crawledPages.length > 0 | unit | `npm test -- src/app/results` | ❌ W0 | ⬜ pending |
| Results page single-URL | UI | 0 | CRAWL-03 | No accordion rendered when crawledPages.length === 0 | unit | `npm test -- src/app/results` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `crawler/src/browser.test.ts` — `extractInternalLinks` unit tests (mock `page.evaluate`)
- [ ] `crawler/src/pipeline/site-wide-merger.test.ts` — `detectCrossPagePatterns` + `runSiteWideAnalysis` unit tests
- [ ] `crawler/src/pipeline/types.ts` — `PageAnalysisResult`, `SiteWideNarrative`, `CrossPagePattern` types added
- [ ] `prisma/schema.prisma` — `CrawledPage`, `CrawledPageIssue`, `CrawledPageEdge` models added + migration run

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 5-page crawl completes within 8 minutes on Fly.io | CRAWL-01 | Requires real network + real Playwright + real PSI API | Submit a URL with 5+ internal links; check Railway logs for total duration |
| Site-wide narrative is coherent across pages | CRAWL-02 | LLM output quality is subjective | Submit multi-page analysis; read Stage 4 narrative for relevance + cross-page insight |
| Per-page accordion root page opens by default | CRAWL-03 | Browser interaction state | Load results page with 2+ crawled pages; verify root page (page_index=0) is open, others closed |
| Single-URL results unchanged from Phase 7 | CRAWL-03 regression | Requires visual comparison | Submit a single URL with no discovered pages; compare output to pre-Phase-8 baseline |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
