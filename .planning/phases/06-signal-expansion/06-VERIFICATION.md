---
phase: 06-signal-expansion
verified: 2026-05-27T00:00:00Z
status: passed
score: 19/19 must-haves verified
overrides_applied: 0
---

# Phase 6: Signal Expansion — Verification Report

**Phase Goal:** Add Core Web Vitals, accessibility, and Lighthouse data to the crawler's signal payload.
**Verified:** 2026-05-27
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | types.ts exports AxeViolationNode, AxeViolation, CWVMetrics, LighthouseScores, ExternalSignals | VERIFIED | types.ts L132–166 — all five interfaces exported |
| 2 | CrawlPass has axeViolations?: AxeViolation[] field | VERIFIED | types.ts L112 — `axeViolations?: AxeViolation[]` under "Populated by Plan 06-02" comment |
| 3 | psi.ts exports fetchPSISignals(url, timeoutMs): Promise<ExternalSignals \| null> | VERIFIED | psi.ts L18 — exact signature matches |
| 4 | psi.ts returns null (not throws) on missing key, timeout, non-200 | VERIFIED | L20–22 (no key), L40–43 (non-200), L57–63 (AbortError/timeout) — all return null |
| 5 | psi.ts parses loadingExperience.metrics for LCP/CLS/INP percentiles | VERIFIED | psi.ts L100–111 — extractCWVFromMetrics reads LARGEST_CONTENTFUL_PAINT_MS, CUMULATIVE_LAYOUT_SHIFT_SCORE, INTERACTION_TO_NEXT_PAINT percentile fields |
| 6 | psi.ts handles empty metrics (cwv: null) and origin_fallback path | VERIFIED | L104–105 returns null when no metric keys; L81–86 falls back to originLoadingExperience with origin_fallback=true |
| 7 | psi.ts parses lighthouseResult.categories['best-practices'].score via bracket notation | VERIFIED | psi.ts L125 — `cats['best-practices']?.score` |
| 8 | index.ts has console.warn for missing PAGESPEED_API_KEY (never process.exit) | VERIFIED | index.ts L61–63 — `console.warn('[feeltrace-crawler] PAGESPEED_API_KEY not set ...')` with no process.exit |
| 9 | scoreExternalSignals() CWV rules: LCP >4000=Critical(4), >2500=High(3); CLS >25=Critical(4), >10=High(3); INP >500=Critical(4), >200=High(3) | VERIFIED | stage1-external-scorer.ts L25–80 — CWV_RULES array, all six thresholds present with correct severities |
| 10 | scoreExternalSignals() Lighthouse rules: perf <0.5=Critical(4), <0.7=High(3); a11y <0.8=High(3), <0.9=Medium(2); seo <0.7=Medium(2) | VERIFIED | stage1-external-scorer.ts L82–128 — LIGHTHOUSE_RULES array, all five rules with correct severities |
| 11 | scoreAxeViolations(): critical→4, serious→3, moderate→2, minor→1; 10-ID cap; signal_source 'axe.<id>'; viewport 'desktop' | VERIFIED | stage1-external-scorer.ts L224–268 — AXE_IMPACT_SEVERITY map (L224–229), slice(0,10) cap (L251), `axe.${v.id}` (L263), viewport 'desktop' (L265) |
| 12 | browser.ts has bypassCSP: true on DESKTOP context only (mobile context unchanged) | VERIFIED | browser.ts L81 — `...(options.viewport === 'desktop' ? { bypassCSP: true } : {})` — conditional spread, mobile path gets no bypassCSP |
| 13 | browser.ts has AxeBuilder scan with .withTags(['wcag2a', 'wcag21aa']) after waitForSpaHydration | VERIFIED | browser.ts L115 (waitForSpaHydration), L121–122 (new AxeBuilder({ page }).withTags(['wcag2a', 'wcag21aa'])) |
| 14 | browser.ts catches axe failures and sets axeViolations = [] (never crashes) | VERIFIED | browser.ts L134–137 — catch block sets `axeViolations = []` and logs console.warn |
| 15 | processor.ts runs fetchPSISignals in parallel with runDualViewportCrawl via Promise.race(Promise.all([...])) | VERIFIED | processor.ts L28–36 — `Promise.race([ Promise.all([ runDualViewportCrawl(...), fetchPSISignals(...) ]), timeout ])` |
| 16 | run-pipeline.ts accepts externalSignals as 5th parameter | VERIFIED | run-pipeline.ts L46 — `externalSignals: ExternalSignals \| null` as 5th param of runAIPipeline |
| 17 | run-pipeline.ts concatenates scoreExternalSignals + scoreAxeViolations onto scoredIssues | VERIFIED | run-pipeline.ts L51 and L53 — push-spread of both scorer outputs onto scoredIssues array |
| 18 | run-pipeline.ts stores cwv + lighthouse in Result.tech_stack._signals | VERIFIED | run-pipeline.ts L62–66 — `_signals: { cwv: externalSignals?.cwv ?? null, lighthouse: externalSignals?.lighthouse ?? null }` merged into techStackWithSignals |
| 19 | @axe-core/playwright in crawler/package.json dependencies | VERIFIED | package.json L17 — `"@axe-core/playwright": "^4.11.3"` in dependencies (not devDependencies) |

**Score:** 19/19 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `crawler/src/lib/types.ts` | New interfaces: AxeViolationNode, AxeViolation, CWVMetrics, LighthouseScores, ExternalSignals; CrawlPass.axeViolations field | VERIFIED | All present at L112–166 |
| `crawler/src/lib/psi.ts` | PSI client returning ExternalSignals \| null | VERIFIED | 146 lines, full implementation with parseCWV and parseLighthouse helpers |
| `crawler/src/pipeline/stage1-external-scorer.ts` | scoreExternalSignals() and scoreAxeViolations() exports | VERIFIED | 269 lines, both functions fully implemented with threshold rules |
| `crawler/src/browser.ts` | AxeBuilder integration, bypassCSP desktop-only | VERIFIED | L81 bypassCSP conditional; L117–138 axe scan block |
| `crawler/src/processor.ts` | Parallel PSI + crawl fetch, passes psiResult to pipeline | VERIFIED | L28–48 — parallel execution and psiResult forwarded to runAIPipeline |
| `crawler/src/pipeline/run-pipeline.ts` | 5th param externalSignals, scorer concatenation, _signals storage | VERIFIED | L41–66 — all three requirements met |
| `crawler/src/index.ts` | Soft warn for PAGESPEED_API_KEY, no exit | VERIFIED | L59–63 |
| `crawler/src/lib/psi.test.ts` | Unit tests for PSI client | VERIFIED | 186 lines, 6 test cases covering null key, timeout, parse, origin_fallback, empty metrics, bracket notation |
| `crawler/src/pipeline/stage1-external-scorer.test.ts` | Unit tests for scorer | VERIFIED | 276 lines, comprehensive CWV + Lighthouse + axe coverage |
| `crawler/src/pipeline/stage1-integration.test.ts` | Integration test for all three Stage 1 scorers together | VERIFIED | 203 lines, exercises scoreSignals + scoreExternalSignals + scoreAxeViolations in combination |
| `crawler/package.json` | @axe-core/playwright in dependencies | VERIFIED | L17 — runtime dependency, not dev-only |

### Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| processor.ts | psi.ts | `import { fetchPSISignals }` + `Promise.all([runDualViewportCrawl, fetchPSISignals])` | VERIFIED |
| processor.ts | run-pipeline.ts | `runAIPipeline(jobId, signals, screenshot, techProfile, psiResult)` — psiResult passed as 5th arg | VERIFIED |
| run-pipeline.ts | stage1-external-scorer.ts | `import { scoreExternalSignals, scoreAxeViolations }` + push-spread at L51/L53 | VERIFIED |
| run-pipeline.ts | types.ts | `import type { ExternalSignals }` — used in function signature | VERIFIED |
| browser.ts | @axe-core/playwright | `import { AxeBuilder }` + `new AxeBuilder({ page }).withTags(...).analyze()` | VERIFIED |
| browser.ts | types.ts | `import { AxeViolation }` — used to type axeViolations local and CrawlPass return | VERIFIED |
| stage1-external-scorer.ts | types.ts | `import type { ExternalSignals, AxeViolation }` | VERIFIED |
| psi.ts | types.ts | `import type { ExternalSignals, CWVMetrics, LighthouseScores }` | VERIFIED |

### Data-Flow Trace

| File | Signal | Source | Status |
|------|--------|--------|--------|
| run-pipeline.ts | CWV data in DB result | psiResult (ExternalSignals \| null) flows from processor → runAIPipeline → techStackWithSignals._signals.cwv | FLOWING |
| run-pipeline.ts | Lighthouse data in DB result | Same path as CWV — stored in _signals.lighthouse | FLOWING |
| run-pipeline.ts | Axe violations in scored issues | desktop.axeViolations from runDualViewportCrawl → scoreAxeViolations → scoredIssues → DB issues | FLOWING |
| run-pipeline.ts | CWV/Lighthouse scored issues | externalSignals → scoreExternalSignals → scoredIssues → DB issues | FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED — no server is running; all checks require live browser or PSI API. Test suite covers behavioral correctness at unit/integration level.

### Probe Execution

Step 7c: No probe-*.sh files declared in plans or found in scripts/. SKIPPED.

### Requirements Coverage

The phase goal — "Add Core Web Vitals, accessibility, and Lighthouse data to the crawler's signal payload" — is fully satisfied:

- CWV field data (LCP, CLS, INP) from CrUX via PSI API: present in ExternalSignals.cwv, parsed by psi.ts, scored by scoreExternalSignals
- WCAG 2.1 violations with element selector, impact level, and help URL: AxeViolation interface in types.ts, collected by browser.ts axe scan, scored by scoreAxeViolations
- Lighthouse category scores (Performance, Accessibility, SEO, Best Practices): present in LighthouseScores type, parsed by parseLighthouse in psi.ts, scored by LIGHTHOUSE_RULES in scoreExternalSignals
- All three signal types feed into Stage 1 scorer: run-pipeline.ts concatenates all three scorer outputs onto scoredIssues before Stage 2

### Anti-Patterns Found

No TBD, FIXME, XXX, PLACEHOLDER, or "not yet implemented" markers found in any phase-modified file.

One minor observation (INFO, not a blocker): the file-level comment on stage1-external-scorer.ts line 4 says "scoreAxeViolations is a stub here — Plan 06-02 fills in the body." This comment was not updated after Plan 06-02 implemented the function. The implementation is complete and correct; the stale comment is misleading but has no runtime impact.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `crawler/src/pipeline/stage1-external-scorer.ts` | 4 | Stale file-level comment says "stub here — Plan 06-02 fills in" after 06-02 was completed | INFO | None — cosmetic only |

### Human Verification Required

None. All observable truths are verifiable by static code analysis. No UI rendering, real-time behavior, or external service integration is required to verify the phase goal.

### Gaps Summary

No gaps found. All 19 must-have truths are verified with direct line-number evidence in the actual source files. The phase goal is achieved: CWV, Lighthouse, and axe accessibility signals are collected, typed, scored, and stored through the complete data path from browser crawl and PSI API fetch through to the DB result record.

---

_Verified: 2026-05-27T00:00:00Z_
_Verifier: Claude (gsd-verifier)_
