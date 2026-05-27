# FeelTrace v1.1 — Roadmap

**Milestone:** v1.1 Analysis Depth
**Status:** Planning
**Phases:** 5–8 (continues from v1.0)
**Requirements:** 15 / 15 mapped

---

## Overview

Four phases in dependency order: clean up v1.0 debt first (Phase 5), then expand signal sources (Phase 6), deepen AI reasoning (Phase 7), and add multi-page crawl last since it builds on the richer per-page pipeline (Phase 8).

---

## Phases

### Phase 5: Tech Debt & Foundation

**Goal:** Clean up v1.0 tech debt and stabilize interfaces before expanding signal coverage
**Depends on:** Nothing (first phase of v1.1)
**Requirements:** DEBT-01, DEBT-02, DEBT-03, DEBT-04

**Success criteria:**
1. Running the crawler produces no dead Gemini import warnings or unused dependency installs
2. Failed analysis jobs show a descriptive error page with the failure reason and a retry CTA — not a 404-style "not found"
3. TechProfile fields compile without type errors in both the crawler package and the Next.js app (no `as any` casts)
4. Crawler service logs RAILWAY_CRAWLER_URL at startup and exits with a descriptive error if the value is missing or malformed

---

### Phase 6: Signal Expansion

**Goal:** Add Core Web Vitals, accessibility, and Lighthouse data to the crawler's signal payload
**Depends on:** Phase 5 (TechProfile types must be stable)
**Requirements:** SIGNAL-01, SIGNAL-02, SIGNAL-03

**Success criteria:**
1. Analysis result includes real-user CWV field data (LCP, CLS, INP) for URLs with CrUX coverage; graceful fallback when CrUX has no data
2. Analysis result includes WCAG 2.1 violations with element selector, impact level, and help URL
3. Analysis result includes Lighthouse category scores (Performance, Accessibility, SEO, Best Practices)
4. All three new signal types feed into the Stage 1 scorer

---

### Phase 7: AI Pipeline Depth

**Goal:** Extend the AI pipeline to produce actionable fixes, severity justification, page-type awareness, benchmark comparisons, and visual analysis
**Depends on:** Phase 6 (new signals feed the pipeline)
**Requirements:** SIGNAL-04, AI-01, AI-02, AI-03, AI-04

**Success criteria:**
1. Each issue includes a concrete fix suggestion (specific action, not advisory)
2. Each issue includes a severity justification paragraph naming user impact
3. Narrative opening identifies detected page type and tailors framing
4. When CWV data is available, narrative includes at least one benchmark comparison
5. Screenshot visual findings appear as a distinct issue category

---

### Phase 8: Multi-page Crawl

**Goal:** Auto-discover and crawl multiple pages, producing a unified site-wide analysis with per-page breakdown
**Depends on:** Phase 7 (richer per-page analysis makes the site-wide merge more meaningful)
**Requirements:** CRAWL-01, CRAWL-02, CRAWL-03

**Success criteria:**
1. Submitting a URL triggers discovery of internal links and crawls up to 5 pages (configurable)
2. Results show a site-wide analysis section with cross-page patterns
3. Results show per-page breakdown with individual issue cards per crawled URL
4. Single-URL mode produces identical output to v1.0 (no regression)

---

## Requirements Coverage

| REQ-ID | Phase | Area |
|--------|-------|------|
| DEBT-01 | Phase 5 | Remove dead Gemini code |
| DEBT-02 | Phase 5 | Failed-job error page |
| DEBT-03 | Phase 5 | TechProfile type consistency |
| DEBT-04 | Phase 5 | Startup validation |
| SIGNAL-01 | Phase 6 | Core Web Vitals (CrUX) |
| SIGNAL-02 | Phase 6 | Accessibility scan (axe-core) |
| SIGNAL-03 | Phase 6 | Lighthouse scores |
| SIGNAL-04 | Phase 7 | Visual screenshot analysis |
| AI-01 | Phase 7 | Actionable fix suggestions |
| AI-02 | Phase 7 | Severity justification |
| AI-03 | Phase 7 | Context-aware narrative |
| AI-04 | Phase 7 | Comparative benchmarking |
| CRAWL-01 | Phase 8 | Auto-discover + multi-page crawl |
| CRAWL-02 | Phase 8 | Unified site-wide analysis |
| CRAWL-03 | Phase 8 | Per-page breakdown in UI |

**Coverage: 15 / 15**

---

*Created: 2026-05-27 for milestone v1.1*
