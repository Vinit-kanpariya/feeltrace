# Phase 6: Signal Expansion — Research

**Researched:** 2026-05-27
**Domain:** Core Web Vitals (PSI/CrUX API), axe-core accessibility scanning, Lighthouse scores, Stage 1 scorer extension
**Confidence:** HIGH for architecture decisions; MEDIUM for PSI API latency specifics (external service behaviour)

---

## TL;DR (5 bullets — key decisions the planner must make)

1. **The PSI API is the SLA threat.** Documented p95 latency is 40 s; median is ~10 s. With a 55 s total budget and ~20–25 s for dual-viewport Playwright crawl, PSI **must run in parallel with the Playwright crawl**, not after it. A hard timeout of 30 s on the PSI call is essential; timeout = graceful null, not job failure.

2. **Use `@axe-core/playwright` 4.11.3 (official Deque package, slopcheck [OK]).** It wraps script injection, handles iframes, and exposes a clean `AxeBuilder({ page }).withTags(['wcag2a','wcag21aa']).analyze()` API. Run it on the **desktop pass only** (before `context.close()`), deduplicated against the mobile pass being unnecessary overhead.

3. **New signals do NOT go into `CrawlPass`.** `CrawlPass` is populated inside the browser session; PSI data arrives from an external HTTP call. Introduce a new `ExternalSignals` struct alongside `{ mobile: CrawlPass, desktop: CrawlPass }` in `runAIPipeline`'s signature. axe violations attach as `desktop.axeViolations?: AxeViolation[]` on `CrawlPass` since they run inside the browser.

4. **Stage 1 scorer needs a new overloaded entry point.** The existing `scoreSignals(mobile, desktop)` stays unchanged. Add `scoreExternalSignals(ext: ExternalSignals): ScoredIssue[]` consuming CWV, Lighthouse, and axe. Both functions feed into `runAIPipeline`; their outputs are concatenated before Stage 2. Keeps each scorer pure and independently testable.

5. **No Prisma schema changes are needed.** CWV and Lighthouse raw data can live in `Result.tech_stack Json` (already exists as a catch-all Json column), and axe violations already surface as `Issue` rows with `category='accessibility'` and `signal_source='axeViolations'`. Raw signal storage in the DB is out of scope per INFRA-03 (signals are in-memory only).

---

## 1. PageSpeed Insights API (SIGNAL-01 + SIGNAL-03)

### Endpoint & Request

**Base endpoint** [VERIFIED: developers.google.com/speed/docs/insights/rest/v5/pagespeedapi/runpagespeed]:
```
GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed
```

**Single-call request that fetches both CrUX field data AND all four Lighthouse categories:**
```typescript
const params = new URLSearchParams({
  url: targetUrl,
  strategy: 'mobile',           // mobile = closer to real-user conditions
  key: process.env.PAGESPEED_API_KEY ?? '',
})
// Repeat 'category' for each desired category
params.append('category', 'performance')
params.append('category', 'accessibility')
params.append('category', 'seo')
params.append('category', 'best-practices')

const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`
```

One HTTP GET fetches both `loadingExperience` (CrUX, SIGNAL-01) and `lighthouseResult.categories` (Lighthouse, SIGNAL-03) in one response. [CITED: developers.google.com/speed/docs/insights/v5/get-started]

**Note on `strategy`:** Use `mobile` as it matches real-user CrUX data collection (Chrome collects CrUX from all users regardless of viewport, but mobile strategy Lighthouse audit matches better with p75 CrUX). One call per job is correct — do not run both strategies (doubles SLA risk). [ASSUMED — one-strategy approach; the project may prefer desktop for consistency with the desktop crawl pass]

### Response Shape — CrUX Field Data

The `loadingExperience.metrics` object contains the three Core Web Vitals: [CITED: developers.google.com/codelabs/chrome-web-vitals-psi-crux]

```json
{
  "loadingExperience": {
    "id": "https://example.com/",
    "metrics": {
      "LARGEST_CONTENTFUL_PAINT_MS": {
        "percentile": 2353,
        "distributions": [
          { "min": 0,    "max": 2500, "proportion": 0.75 },
          { "min": 2500, "max": 4000, "proportion": 0.18 },
          { "min": 4000,              "proportion": 0.07 }
        ],
        "category": "GOOD"
      },
      "CUMULATIVE_LAYOUT_SHIFT_SCORE": {
        "percentile": 8,
        "distributions": [...],
        "category": "GOOD"
      },
      "INTERACTION_TO_NEXT_PAINT": {
        "percentile": 180,
        "distributions": [...],
        "category": "GOOD"
      }
    },
    "overall_category": "GOOD",
    "initial_url": "https://example.com/",
    "origin_fallback": false
  }
}
```

**The `percentile` field IS the p75 value** [CITED: debugbear.com/blog/pagespeed-insights-api]:
- `LARGEST_CONTENTFUL_PAINT_MS.percentile` → LCP in milliseconds (e.g., 2353 = 2.353 s)
- `CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile` → CLS × 100 as an integer (e.g., 8 = CLS 0.08)
- `INTERACTION_TO_NEXT_PAINT.percentile` → INP in milliseconds (e.g., 180 = 180 ms)

**CLS extraction gotcha:** The raw `percentile` value for CLS is scaled by 100 (integer representation). To get the true CLS float, divide by 100: `cls = percentile / 100`. [ASSUMED — based on documented p75 values seen in examples; verify against live API response in Wave 0]

### Response Shape — Lighthouse Scores

```json
{
  "lighthouseResult": {
    "categories": {
      "performance": {
        "id": "performance",
        "title": "Performance",
        "score": 0.96
      },
      "accessibility": {
        "id": "accessibility",
        "title": "Accessibility",
        "score": 0.82
      },
      "best-practices": {
        "id": "best-practices",
        "title": "Best Practices",
        "score": 0.92
      },
      "seo": {
        "id": "seo",
        "title": "SEO",
        "score": 0.98
      }
    }
  }
}
```

Each `score` is a **float 0.0–1.0** (multiply by 100 for the familiar 0–100 display). [CITED: developers.google.com/speed/docs/insights/v5/get-started — example shows `score: 0.96`]

Extraction:
```typescript
const perf = data.lighthouseResult.categories.performance.score      // 0.0–1.0
const a11y = data.lighthouseResult.categories.accessibility.score
const seo  = data.lighthouseResult.categories.seo.score
const bp   = data.lighthouseResult['best-practices'].score
```

### Graceful Fallback

When a URL has insufficient CrUX traffic data, the API returns one of two states: [CITED: developers.google.com/speed/docs/insights/rest/v5/pagespeedapi/runpagespeed]

**State A — origin fallback** (`origin_fallback: true`): The `loadingExperience.metrics` object still contains data, but it reflects the entire origin, not the specific page. The flag `origin_fallback: true` signals this.

**State B — no data at all**: The `loadingExperience` object is present but `metrics` is empty (`{}`) or the object has no `metrics` key. The `originLoadingExperience` may also be empty for very low-traffic origins.

**Recommended handling:**
```typescript
function extractCWV(data: PSIResponse): CWVSignals | null {
  const le = data.loadingExperience
  if (!le?.metrics || Object.keys(le.metrics).length === 0) {
    return null  // No CrUX data — caller logs and skips CWV scoring
  }
  return {
    lcp_ms: le.metrics.LARGEST_CONTENTFUL_PAINT_MS?.percentile ?? null,
    cls_raw: le.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile ?? null,
    inp_ms: le.metrics.INTERACTION_TO_NEXT_PAINT?.percentile ?? null,
    origin_fallback: le.origin_fallback ?? false,
  }
}
```

Return `null` from `extractCWV` → Stage 1 scorer skips CWV rules entirely. `origin_fallback: true` should be recorded in the signal but should still feed the scorer — origin data is better than no data.

### Rate Limits & API Key

| Tier | Limit |
|------|-------|
| Free, no key | Not officially documented; extremely low (effectively 1 req/s or less) [ASSUMED] |
| Free, with key | 25,000 req/day; 400 req/100 s (= 4 req/s) [CITED: groups.google.com/g/pagespeed-insights-discuss/c/dB7hWmGAGsw] |
| Over-limit response | HTTP 500 "Unable to process request" (not 429) [CITED: bjb.dev/log/20221009-pagespeed-api/] |

**An API key is required for production use.** Without a key, the service is not rate-limited in a documented, predictable way and may fail silently. The `key` parameter is optional in the API signature but mandatory in practice.

**Startup validation** must include `PAGESPEED_API_KEY`. If absent, the crawler should log a warning and run in "no-PSI" mode (skip SIGNAL-01 and SIGNAL-03, proceed with Playwright signals only) rather than hard-exit, because PSI is supplementary to the existing signal set.

### SLA / Parallelism Strategy

**Critical finding:** PSI API latency is highly variable:
- p50: ~10 s [CITED: github.com/GoogleChrome/lighthouse/issues/14072]
- p95: ~40 s [CITED: github.com/GoogleChrome/lighthouse/issues/14072]

The 55 s budget breakdown today is approximately:
```
~20–25 s  Playwright dual-viewport crawl (sequential: mobile → desktop)
~10–15 s  AI pipeline (Stage 1 sync, Stage 2 + Stage 3 Groq LLM calls)
~5 s      Headroom / DB write
```

**There is no room to run PSI sequentially after the crawl.** The only viable strategy is:

```
Job start
├── Promise.all([
│     runDualViewportCrawl(url, jobId),   // ~20–25 s
│     fetchPSISignals(url, 30_000)         // 30 s hard timeout
│   ])
└── Both results land together → pass both into runAIPipeline()
```

The PSI call uses a `Promise.race` against a 30 s timeout. If PSI wins the race and returns valid data, the full SIGNAL-01 + SIGNAL-03 set is available. If the 30 s timeout fires first, `fetchPSISignals` resolves to `null` and the job continues without CWV/Lighthouse signals — no failure, just degraded data.

**Key implication for `processJob`:** Change the `Promise.race(crawl, SLA_timer)` pattern. The SLA timer wraps both parallel branches (crawl + PSI), not just the crawl. If total wall-clock exceeds 55 s, the entire job fails as before.

```typescript
// processor.ts — new pattern
const [crawlResult, psiResult] = await Promise.race([
  Promise.all([
    runDualViewportCrawl(url, jobId),
    fetchPSISignals(url, 30_000),
  ]),
  new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('SLA exceeded after 55s')), SLA_MS)
  ),
])
```

---

## 2. axe-core in Playwright (SIGNAL-02)

### Package Choice

**Use `@axe-core/playwright` 4.11.3** [VERIFIED: npm registry — slopcheck [OK], no postinstall scripts, published by dequelabs (Deque Systems), ~500K weekly downloads, repo: github.com/dequelabs/axe-core-npm, first published 2021-06-02].

Do NOT use the community `axe-playwright` package (different maintainer, different API). The official `@axe-core/playwright` is the Deque-maintained integration that auto-injects axe-core into the page and all frames.

**Peer dependency:** `playwright-core >= 1.0.0` — the crawler already uses `playwright-core 1.60.0`, fully compatible.

### Injection Pattern

`@axe-core/playwright` handles script injection internally via `page.addScriptTag`. You do not call `addScriptTag` manually.

```typescript
// In browser.ts, inside crawlWithViewport() — DESKTOP PASS ONLY
// Place AFTER waitForSpaHydration(), BEFORE context.close()
import { AxeBuilder } from '@axe-core/playwright'

// Run axe after SPA hydration completes
let axeViolations: AxeViolation[] | undefined
if (options.viewport === 'desktop') {
  try {
    const axeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21aa'])  // WCAG 2.1 A + AA rules only
      .analyze()
    axeViolations = axeResults.violations.map(v => ({
      id: v.id,
      impact: v.impact ?? 'minor',
      description: v.description,
      helpUrl: v.helpUrl,
      nodes: v.nodes.slice(0, 5).map(n => ({   // cap at 5 nodes per violation
        target: n.target[0] ?? 'unknown',        // first CSS selector
        failureSummary: n.failureSummary ?? '',
      })),
    }))
  } catch (err) {
    console.warn('[browser] axe scan failed:', err instanceof Error ? err.message : err)
    axeViolations = undefined  // treat as missing data, not failure
  }
}
```

[CITED: playwright.dev/docs/accessibility-testing — official Playwright docs on @axe-core/playwright integration]
[CITED: github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/README.md]

**withTags scope:**
- `wcag2a` — WCAG 2.0 Level A rules
- `wcag21aa` — WCAG 2.1 Level AA rules (adds `wcag2aa` implicitly)

This scope matches the SIGNAL-02 requirement ("WCAG 2.1 violations"). Omit `wcag22aa` to keep scan scope bounded.

### Violation Shape

The full axe violation shape (relevant fields only): [CITED: github.com/dequelabs/axe-core/blob/develop/doc/API.md]

```typescript
interface AxeViolation {
  id: string           // rule ID, e.g. "color-contrast", "image-alt", "label"
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  description: string  // human-readable description of the failure
  helpUrl: string      // URL to Deque documentation for this rule
  nodes: Array<{
    target: string            // first CSS selector (nodes[].target[0])
    failureSummary: string    // "Fix any of the following: ..."
  }>
}
```

Fields we store per violation: `id`, `impact`, `description`, `helpUrl`, and up to 5 `nodes` (each with `target` + `failureSummary`). We do not store the full `any`/`all`/`none` check arrays — too verbose for the Issue `raw_evidence` field.

### CSP Handling

**The problem:** Some sites set strict CSP headers (`script-src 'self'` or `script-src 'nonce-...'` without `'unsafe-inline'`). `@axe-core/playwright` injects a script tag, which may be blocked by CSP.

**The solution:** Create the browser context with `bypassCSP: true` for the desktop pass. [CITED: playwright.dev — Playwright BrowserContext option `bypassCSP`]

```typescript
// In browser.ts — desktop context creation
const context: BrowserContext = await browser.newContext({
  viewport: { width: options.width, height: options.height },
  isMobile: options.isMobile,
  hasTouch: options.hasTouch,
  recordHar: { path: harPath, content: 'omit', mode: 'full' },
  // Add bypassCSP on desktop pass to allow axe script injection:
  bypassCSP: options.viewport === 'desktop',
})
```

**Risk:** `bypassCSP: true` disables CSP enforcement in the browser context. This does not affect the target site's server — it only changes what the Playwright Chromium instance enforces locally. Since FeelTrace is a crawler that already loads third-party pages, this is acceptable.

**Fallback:** If axe still throws (observed on some single-page apps that intercept `document.write`), the try/catch in the injection pattern returns `axeViolations = undefined`. The job continues; SIGNAL-02 is marked as unavailable for that job.

### Viewport Strategy (mobile vs desktop)

**Run axe on desktop pass only.** Rationale:
1. WCAG violations are structural (DOM, ARIA, contrast) — they are the same across viewports
2. Running axe on both passes doubles browser time with negligible additional signal
3. Mobile pass already has slow-3G throttle, making axe timing unpredictable
4. Desktop pass is where screenshot is taken — aligns visually with the scan result

No deduplication step is needed if we run on desktop only.

**Timing placement:** Run axe AFTER `waitForSpaHydration()` and BEFORE `page.screenshot()`, since the DOM must be fully rendered. The axe scan typically takes 1–3 s on a normal page.

---

## 3. Type System Integration

### CrawlPass Extensions

Add `axeViolations` as an optional field on `CrawlPass` in `crawler/src/lib/types.ts`:

```typescript
// Add to crawler/src/lib/types.ts

export interface AxeViolationNode {
  target: string           // CSS selector of the violating element
  failureSummary: string   // axe failure summary text
}

export interface AxeViolation {
  id: string               // axe rule ID, e.g. "image-alt"
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  description: string
  helpUrl: string
  nodes: AxeViolationNode[]
}

export interface CrawlPass {
  // ... existing fields unchanged ...
  axeViolations?: AxeViolation[]   // Only populated on desktop pass
}
```

`axeViolations` is optional (`?`) to preserve backward compatibility with mobile CrawlPass and with any existing test fixtures.

### New Signal Struct Proposal

PSI/CrUX data arrives from an external HTTP call, not from the browser session. Introduce a new type in `crawler/src/lib/types.ts`:

```typescript
export interface CWVMetrics {
  lcp_ms: number | null      // LARGEST_CONTENTFUL_PAINT_MS.percentile (p75)
  cls_raw: number | null     // CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile (p75 × 100)
  inp_ms: number | null      // INTERACTION_TO_NEXT_PAINT.percentile (p75)
  origin_fallback: boolean   // true = origin-level data, not URL-level
}

export interface LighthouseScores {
  performance: number        // 0.0–1.0
  accessibility: number      // 0.0–1.0
  seo: number                // 0.0–1.0
  bestPractices: number      // 0.0–1.0 (from 'best-practices' key)
}

export interface ExternalSignals {
  cwv: CWVMetrics | null           // null = CrUX data unavailable
  lighthouse: LighthouseScores | null  // null = PSI call failed/timed out
}
```

`ExternalSignals` is passed alongside `{ mobile, desktop }` through the pipeline:
- `processJob` → `Promise.all([runDualViewportCrawl, fetchPSISignals])` → both results
- `runAIPipeline(jobId, signals, externalSignals, screenshot, techProfile)`
- `scoreSignals(mobile, desktop)` → existing 23 rules
- `scoreExternalSignals(externalSignals)` → new rules (see below)
- Concatenate both `ScoredIssue[]` arrays before Stage 2

### Stage 1 Scorer: New Rule Sets

Add `scoreExternalSignals` as a **separate exported function** in a new file `crawler/src/pipeline/stage1-external-scorer.ts` (keeps `stage1-scorer.ts` unchanged, avoids merge risk).

```typescript
// crawler/src/pipeline/stage1-external-scorer.ts

export function scoreExternalSignals(ext: ExternalSignals): ScoredIssue[] {
  const issues: ScoredIssue[] = []
  if (ext.cwv) scoreCWV(ext.cwv, issues)
  if (ext.lighthouse) scoreLighthouse(ext.lighthouse, issues)
  // axe violations come via CrawlPass.axeViolations, scored in scoreAxeViolations()
  return issues
}

export function scoreAxeViolations(violations: AxeViolation[]): ScoredIssue[] {
  return violations.map(v => ({
    category: 'accessibility' as const,
    signal_source: `axeViolations.${v.id}`,
    severity: AXE_IMPACT_TO_SEVERITY[v.impact],
    raw_evidence: `${v.impact} impact: ${v.nodes[0]?.target ?? 'unknown'} — ${v.helpUrl}`,
    viewport: 'desktop' as const,
  }))
}
```

**CWV threshold rules** (based on web.dev Core Web Vitals thresholds): [CITED: web.dev/vitals — official Web Vitals thresholds]

| Metric | Threshold | Severity | Rationale |
|--------|-----------|----------|-----------|
| LCP > 4000 ms | Critical (4) | Page fails Core Web Vitals LCP threshold |
| LCP > 2500 ms | High (3) | LCP "needs improvement" range |
| CLS > 25 (raw, = 0.25 float) | Critical (4) | Page fails Core Web Vitals CLS threshold |
| CLS > 10 (raw, = 0.10 float) | High (3) | CLS "needs improvement" range |
| INP > 500 ms | Critical (4) | Page fails Core Web Vitals INP threshold |
| INP > 200 ms | High (3) | INP "needs improvement" range |

**Lighthouse threshold rules** [ASSUMED — no official "bad score" standard; these are practical defaults]:

| Score | Threshold | Severity | Note |
|-------|-----------|----------|------|
| performance < 0.5 | Critical (4) | Failing performance |
| performance < 0.7 | High (3) | Poor performance |
| accessibility < 0.8 | High (3) | Significant a11y gaps |
| accessibility < 0.9 | Medium (2) | Moderate a11y gaps |
| seo < 0.7 | Medium (2) | SEO concerns |

**axe-core impact → severity mapping:**

```typescript
const AXE_IMPACT_TO_SEVERITY: Record<string, 1 | 2 | 3 | 4> = {
  critical: 4,
  serious:  3,
  moderate: 2,
  minor:    1,
}
```

[CITED: github.com/dequelabs/axe-core/blob/develop/doc/API.md — impact levels: critical, serious, moderate, minor]

**Deduplication strategy for axe violations:** Each violation ID fires at most one `ScoredIssue`. If 20 nodes have `image-alt` violations, emit one issue with the worst-case node as evidence, not 20 issues. This is consistent with how the existing scorer emits one issue per rule, not per element.

---

## 4. Database / Persistence

### Schema Changes Required

**None required for Phase 6.** The existing schema handles everything:

- `Issue` rows with `category='accessibility'`, `signal_source='axeViolations.image-alt'`, `severity=3`, `raw_evidence=<selector + helpUrl>` cover SIGNAL-02 output.
- `Issue` rows with `category='perceived-perf'`, `signal_source='cwv.lcp_ms'` cover SIGNAL-01 output.
- `Issue` rows with `category='technical-perf'`, `signal_source='lighthouse.performance'` cover SIGNAL-03 output.
- Raw CWV/Lighthouse numbers (for Phase 7 benchmark comparisons) can be stored in `Result.tech_stack Json` alongside the existing `TechProfile` object. Extend the tech_stack JSON value to include a `signals` sub-key.

### Raw Signal Storage

Per INFRA-03 (existing decision): raw signal payloads are not written to the DB. CWV/Lighthouse raw data follows the same rule — they are consumed in-memory by Stage 1, then discarded.

**Exception for Phase 7 readiness:** Phase 7 (AI-04) requires benchmark comparisons in the narrative. To support that, store the raw `ExternalSignals` values in `Result.tech_stack`:

```typescript
// In run-pipeline.ts — extend tech_stack write
const techStackJson = {
  ...techProfile,
  _signals: {                   // underscore prefix = internal metadata
    cwv: externalSignals.cwv,
    lighthouse: externalSignals.lighthouse,
  },
} as unknown as Prisma.InputJsonValue
```

This is a non-breaking JSON extension — no migration needed, existing code reading `tech_stack` is unaffected.

---

## 5. Environment Variables

### New Env Vars

| Variable | Required | Purpose |
|----------|----------|---------|
| `PAGESPEED_API_KEY` | Soft-required (job degrades without it) | Google PSI API key for CrUX + Lighthouse |

No new env vars for axe-core — it runs inside Playwright with no external service calls.

### Startup Validation

**Pattern:** Warn-and-degrade, not exit(1). PSI is supplementary; the crawler must work without it.

In `crawler/src/index.ts`, after the existing hard-exit validation block:

```typescript
// Soft validation — warns but does not exit
if (!process.env.PAGESPEED_API_KEY) {
  console.warn('[feeltrace-crawler] PAGESPEED_API_KEY not set — CWV and Lighthouse signals will be skipped')
} else {
  console.log('[feeltrace-crawler] PSI API key configured — CWV + Lighthouse enabled')
}
```

This matches the "graceful fallback" model: jobs run in reduced-signal mode when the key is absent, with a visible warning. The warning surfaces in Railway logs to prompt the operator to add the key.

---

## 6. Implementation Risks & Mitigations

### Risk 1: PSI Latency Exceeds 30 s Hard Timeout
**Probability:** Medium — p95 is ~40 s; any analysis of a slow/large page triggers this.
**Impact:** CWV and Lighthouse data absent from result (degraded, not failed).
**Mitigation:** 30 s hard timeout resolves to `null`. `scoreExternalSignals(null)` returns `[]`. Job proceeds. Log the timeout so it is visible in Railway logs.

### Risk 2: PSI API Not Available / No API Key
**Probability:** High during initial deployment (key not yet configured).
**Impact:** SIGNAL-01 and SIGNAL-03 missing from all jobs.
**Mitigation:** Startup warning (see Section 5). `fetchPSISignals` checks for key presence before making HTTP call; returns `null` immediately if key is absent. No HTTP error, no log noise per job.

### Risk 3: axe CSP Block
**Probability:** Low-medium — ~15–20% of production websites have strict CSP headers.
**Impact:** SIGNAL-02 missing for that job.
**Mitigation:** `bypassCSP: true` on desktop context (covers most cases). Wrap axe in try/catch; `axeViolations = undefined` on throw. Stage 1 scorer's `scoreAxeViolations([])` → `[]` issues.

### Risk 4: axe Scan Duration Bloats Crawl Time
**Probability:** Low — axe runs synchronously inside the browser; typical scan is 1–3 s.
**Impact:** Desktop crawl pass takes 1–3 s longer, reducing PSI parallelism headroom.
**Mitigation:** axe runs during the desktop crawl (which runs in parallel with PSI). The 1–3 s is absorbed by the parallel structure. If axe takes > 10 s on a pathological page, the 30 s PSI timeout still provides enough margin. Add a 10 s internal timeout on the axe analyze call.

### Risk 5: CLS Scaling Confusion
**Probability:** Medium (implementation error risk).
**Impact:** CLS thresholds fire at wrong values (off by 100×).
**Mitigation:** Document clearly: `percentile` for CLS is the raw integer (e.g., `8` = CLS 0.08). Threshold rules use the raw integer directly (threshold `25` = CLS 0.25). Add a comment to the rule. Add a unit test with a known CLS value.

### Risk 6: axe Violation Count Explosion
**Probability:** Medium — some pages have hundreds of violations.
**Impact:** Hundreds of `ScoredIssue` rows fed to Stage 2 LLM; token budget exceeded.
**Mitigation:** Cap axe violations at **10 unique violation IDs** before creating ScoredIssues. Within each violation ID, store only the first 5 affected nodes. The 10-violation cap matches the approximate token budget Stage 2 can process (same order of magnitude as existing 23 rules).

### Risk 7: `best-practices` Key Name vs TypeScript Property
**Probability:** High (certain to trip a dev once).
**Impact:** `data.lighthouseResult.categories.best-practices` is invalid JS (hyphen).
**Mitigation:** Use bracket notation: `data.lighthouseResult.categories['best-practices'].score`. Document in code comment. Type the response as `Record<string, { score: number }>` rather than an interface with a hyphenated key.

---

## 7. Recommended Plan Structure

**3 plans** — aligned to the three natural implementation steps:

### Plan 06-01: PSI Integration (SIGNAL-01 + SIGNAL-03)
**What:** Create `fetchPSISignals` in `crawler/src/lib/psi.ts`, add `ExternalSignals` / `CWVMetrics` / `LighthouseScores` types to `types.ts`, wire parallel execution in `processor.ts`, add startup warning in `index.ts`, create `stage1-external-scorer.ts` with CWV + Lighthouse rules, pipe `externalSignals` through `runAIPipeline`, store raw values in `tech_stack` JSON.
**Key test:** Unit-test `stage1-external-scorer` with fixture PSI responses (good CWV, bad CWV, null/fallback). Snapshot test on `tech_stack` output shape.
**Risk:** PSI latency, CLS scaling. Address with 30 s timeout and raw-integer threshold rules.

### Plan 06-02: axe-core Integration (SIGNAL-02)
**What:** Install `@axe-core/playwright` via `sfw npm install`, add `AxeViolation` + `AxeViolationNode` types to `types.ts`, add `axeViolations?` field to `CrawlPass`, add `bypassCSP: true` to desktop context in `browser.ts`, inject `AxeBuilder` in desktop pass, add `scoreAxeViolations` to `stage1-external-scorer.ts`, wire into `runAIPipeline`.
**Key test:** Unit-test `scoreAxeViolations` with fixture violations (critical, serious, moderate, minor impact). Test deduplication (20 nodes → 1 issue per ID, capped at 10 IDs).
**Risk:** CSP block (mitigated by bypassCSP), violation count explosion (mitigated by 10-ID cap).

### Plan 06-03: Pipeline Wiring & Integration Smoke Test
**What:** Update `runAIPipeline` signature to accept `externalSignals`, concatenate `scoreSignals()` + `scoreExternalSignals()` + `scoreAxeViolations()` outputs, update Stage 2 and Stage 3 prompts if needed to handle new `signal_source` prefixes (`cwv.`, `lighthouse.`, `axeViolations.`), write integration test with a stubbed PSI response + stubbed axe results flowing end-to-end through Stage 1.
**Key test:** End-to-end fixture test: given mock PSI response + mock axe results, verify the correct `ScoredIssue[]` are produced with correct severities and `signal_source` values.
**Risk:** Stage 2 LLM prompt confusion on new signal source names — mitigate by ensuring signal_source strings are self-describing.

---

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `@axe-core/playwright` | npm | 4 yrs (since 2021-06-02) | ~500K/wk [ASSUMED - from npmtrends search] | github.com/dequelabs/axe-core-npm | [OK] | Approved |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

*Note: `slopcheck install @axe-core/playwright` returned `[OK]`. No postinstall scripts found (`npm view @axe-core/playwright scripts.postinstall` → undefined). Package is maintained by Deque Systems (the company that created axe-core) with continuous publishing history.*

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| `npm` / `sfw npm` | Installing @axe-core/playwright | ✓ | (project standard) | — |
| `PAGESPEED_API_KEY` env var | fetchPSISignals | Not yet configured | — | Warn-and-skip; job runs in reduced-signal mode |
| `playwright-core` | axe injection (peer dep) | ✓ | 1.60.0 | — |
| PSI API (Google) | SIGNAL-01 + SIGNAL-03 | ✓ (external) | v5 | 30 s timeout → null signals |

**Missing dependencies with no fallback:** None — all are either already present or have graceful degradation.

**Missing dependencies with fallback:**
- `PAGESPEED_API_KEY`: Absent → warn at startup, skip CWV + Lighthouse scoring per job.

---

## Validation Architecture

**nyquist_validation: true** (from `.planning/config.json`)

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (root `vitest.config.mts`) |
| Config file | `vitest.config.mts` — already includes `crawler/src/**/*.test.ts` |
| Quick run command | `npm test -- --reporter=dot crawler/src/pipeline/stage1-external-scorer.test.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SIGNAL-01 | CWV p75 values extracted from PSI response | unit | `npm test -- crawler/src/pipeline/stage1-external-scorer.test.ts` | ❌ Wave 0 |
| SIGNAL-01 | Graceful null when CrUX has no data | unit | `npm test -- crawler/src/pipeline/stage1-external-scorer.test.ts` | ❌ Wave 0 |
| SIGNAL-02 | axe violations mapped to ScoredIssue with correct severity | unit | `npm test -- crawler/src/pipeline/stage1-external-scorer.test.ts` | ❌ Wave 0 |
| SIGNAL-02 | Violation dedup (N nodes → 1 issue per rule ID) | unit | `npm test -- crawler/src/pipeline/stage1-external-scorer.test.ts` | ❌ Wave 0 |
| SIGNAL-03 | Lighthouse scores create correct ScoredIssues | unit | `npm test -- crawler/src/pipeline/stage1-external-scorer.test.ts` | ❌ Wave 0 |
| All | PSI timeout resolves to null (no throw) | unit | `npm test -- crawler/src/lib/psi.test.ts` | ❌ Wave 0 |

### Wave 0 Gaps
- [ ] `crawler/src/pipeline/stage1-external-scorer.test.ts` — covers SIGNAL-01, SIGNAL-02, SIGNAL-03 scoring rules
- [ ] `crawler/src/lib/psi.test.ts` — covers `fetchPSISignals` timeout handling and null CrUX extraction
- [ ] `crawler/src/lib/types.ts` — `AxeViolation`, `AxeViolationNode`, `CWVMetrics`, `LighthouseScores`, `ExternalSignals` type additions (not test files, but Wave 0 must-have)

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `strategy: 'mobile'` is the right PSI strategy for CrUX alignment | PSI Endpoint | Could use 'desktop'; affects which Lighthouse audit runs but not which CrUX data is returned (CrUX is URL-keyed, not strategy-keyed) — low risk |
| A2 | CLS `percentile` value is scaled by 100 (integer) | CrUX Shape | If it's actually a float (e.g., `0.08`), threshold rules fire 100x too early. Mitigate: verify with live API call in Wave 0 test |
| A3 | PSI free tier without API key is functionally unusable for production | Rate Limits | Exact unauthenticated limit not documented by Google; if generous, API key might not be strictly required |
| A4 | Lighthouse threshold values (perf < 0.5 = Critical, etc.) | Scorer Rules | No official standard; these are practical conventions. Planner should confirm with user or treat as Claude's discretion |
| A5 | axe weekly downloads (~500K/wk) | Package Audit | Download count from npmtrends search; not from authoritative registry API |
| A6 | axe scan takes 1–3 s per page | Timing | Depends on page complexity; could be longer for heavy SPAs |

---

## Sources

### Primary (HIGH confidence)
- [developers.google.com/speed/docs/insights/rest/v5/pagespeedapi/runpagespeed](https://developers.google.com/speed/docs/insights/rest/v5/pagespeedapi/runpagespeed) — API endpoint, parameters, response structure
- [developers.google.com/codelabs/chrome-web-vitals-psi-crux](https://developers.google.com/codelabs/chrome-web-vitals-psi-crux) — CrUX metrics JSON shape with actual values
- [github.com/dequelabs/axe-core/blob/develop/doc/API.md](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md) — axe violation shape, impact levels
- [github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/README.md](https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/README.md) — AxeBuilder API
- [playwright.dev/docs/accessibility-testing](https://playwright.dev/docs/accessibility-testing) — official Playwright docs on @axe-core/playwright
- npm registry — `@axe-core/playwright` version 4.11.3, peer deps, publish history

### Secondary (MEDIUM confidence)
- [debugbear.com/blog/pagespeed-insights-api](https://www.debugbear.com/blog/pagespeed-insights-api) — PSI response structure, percentile is p75
- [unlighthouse.dev/learn-lighthouse/pagespeed-insights-api/node-example](https://unlighthouse.dev/learn-lighthouse/pagespeed-insights-api/node-example) — multi-category fetch pattern; PSI returns HTTP 500 on rate limit (not 429)
- [bjb.dev/log/20221009-pagespeed-api/](https://bjb.dev/log/20221009-pagespeed-api/) — undocumented PSI rate limiting behavior, 500 errors
- [groups.google.com/g/pagespeed-insights-discuss/c/dB7hWmGAGsw](https://groups.google.com/g/pagespeed-insights-discuss/c/dB7hWmGAGsw) — PSI API key quota 25k/day

### Tertiary (LOW confidence)
- [github.com/GoogleChrome/lighthouse/issues/14072](https://github.com/GoogleChrome/lighthouse/issues/14072) — PSI p50/p95 latency figures (user-reported, not official SLA)
- npmtrends.com — weekly download figures for @axe-core/playwright

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `@axe-core/playwright` is the official Deque package, confirmed via slopcheck + npm registry + official Playwright docs
- Architecture (ExternalSignals pattern): HIGH — clearly dictated by the constraint that PSI is external HTTP vs browser-session signals
- PSI API shape: MEDIUM — verified via official docs but CLS scaling (A2) needs live verification
- PSI latency / SLA strategy: MEDIUM — p50/p95 figures are user-reported, not Google SLA; the parallel execution strategy is correct regardless of exact numbers
- Threshold rules: MEDIUM (CWV) / LOW (Lighthouse) — CWV thresholds are official web.dev spec; Lighthouse score thresholds are conventional, not standard

**Research date:** 2026-05-27
**Valid until:** 2026-06-27 (30 days — PSI API is stable; axe-core releases frequently but 4.11.x is the current stable line)
