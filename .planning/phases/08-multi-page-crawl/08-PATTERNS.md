# Phase 8: Multi-page Crawl — Pattern Map

**Mapped:** 2026-05-28
**Files analyzed:** 12 (8 modified + 4 new)
**Analogs found:** 12 / 12

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `crawler/src/browser.ts` | utility (browser) | request-response | `crawler/src/browser.ts` itself (extension) | exact |
| `crawler/src/processor.ts` | orchestrator | batch, sequential | `crawler/src/processor.ts` itself (extension) | exact |
| `crawler/src/pipeline/run-pipeline.ts` | service | request-response | `crawler/src/pipeline/run-pipeline.ts` itself (extension) | exact |
| `crawler/src/pipeline/types.ts` | model/types | — | `crawler/src/pipeline/types.ts` itself (extension) | exact |
| `crawler/src/lib/types.ts` | model/types | — | `crawler/src/lib/types.ts` itself (extension) | exact |
| `prisma/schema.prisma` | config (schema) | CRUD | `prisma/schema.prisma` Issue + CausalEdge models | exact |
| `crawler/prisma/schema.prisma` | config (schema) | CRUD | `crawler/prisma/schema.prisma` (sync copy) | exact |
| `src/app/results/[jobId]/page.tsx` | component (page) | request-response | `src/app/results/[jobId]/page.tsx` itself (extension) | exact |
| `crawler/src/pipeline/site-wide-merger.ts` | service | batch, transform | `crawler/src/pipeline/stage3-narrator.ts` | role-match |
| `crawler/src/pipeline/site-wide-merger.test.ts` | test | — | `crawler/src/pipeline/stage3-narrator.test.ts` | role-match |
| `crawler/src/browser.test.ts` | test | — | `crawler/src/pipeline/stage1-scorer.test.ts` | role-match |
| `src/components/PageAccordionSection.tsx` | component (client) | event-driven | `src/components/ShareButton.tsx` | role-match |

---

## Pattern Assignments

### `crawler/src/browser.ts` — add `extractInternalLinks()`

**Analog:** `crawler/src/browser.ts` (the file itself, extension at end of `crawlWithViewport`)

**Imports pattern** (lines 1-8 of existing file — no new imports needed):
```typescript
import { chromium, Browser, BrowserContext, Page } from 'playwright-core'
import { AxeBuilder } from '@axe-core/playwright'
import { BrowserFingerprint, CrawlPass, TechProfile, AxeViolation } from './lib/types'
import { extractDOMSignals } from './extractors/dom'
// ... (existing imports unchanged)
```

**Insertion point** (line 185 in existing file — BEFORE `await context.close()`):
```typescript
// Desktop-only: extract internal links before context closes (context.close() invalidates page)
let internalLinks: string[] = []
if (options.viewport === 'desktop') {
  internalLinks = await extractInternalLinks(page, url)
  console.log(`[browser] Discovered ${internalLinks.length} internal links from ${url}`)
}

await context.close() // flushes HAR to disk (must happen after coverage stops AND after link extraction)
```

**New exported function** (add after `isPrivateHost` and before `waitForSpaHydration`, or at bottom of file):
```typescript
export async function extractInternalLinks(page: Page, baseUrl: string): Promise<string[]> {
  const origin = new URL(baseUrl).origin
  const hrefs: (string | null)[] = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href'))
  )

  const seen = new Set<string>()
  const links: string[] = []

  for (const href of hrefs) {
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue
    try {
      const absolute = new URL(href, baseUrl).href
      const normalized = absolute.split('#')[0].replace(/\/$/, '') || absolute
      if (!normalized.startsWith(origin)) continue
      if (seen.has(normalized)) continue
      if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) continue
      seen.add(normalized)
      links.push(normalized)
    } catch {
      // malformed href — skip
    }
  }

  return links
}
```

**Return value extension** — `crawlWithViewport` return object at line 188-198 must include `internalLinks`:
```typescript
return {
  viewport: options.viewport,
  domSignals,
  cssSignals,
  jsSignals,
  networkSignals,
  screenshot,
  browserFingerprint,
  axeViolations,
  internalLinks,  // NEW — populated only for desktop pass; empty array for mobile
}
```

**Critical constraint:** `extractInternalLinks` MUST be called BEFORE `context.close()` on line 185. After `context.close()`, `page` is invalidated. The existing HAR note "must happen after coverage stops" applies equally here.

---

### `crawler/src/processor.ts` — multi-page loop

**Analog:** `crawler/src/processor.ts` (the file itself; replace the existing `SLA_MS` constant and `processJob` body)

**Imports pattern** (lines 1-4 of existing file — add new imports):
```typescript
import { prisma } from './lib/prisma'
import { runDualViewportCrawl } from './browser'
import { runAIPipeline } from './pipeline/run-pipeline'
import { fetchPSISignals } from './lib/psi'
import { runSiteWideAnalysis } from './pipeline/site-wide-merger'   // NEW
import { getGroqClient } from './lib/groq-client'                    // NEW
import type { PageAnalysisResult } from './pipeline/types'           // NEW
```

**Constants pattern** — replace the single `SLA_MS = 55_000` with:
```typescript
const MAX_PAGES = Math.min(parseInt(process.env.MAX_CRAWL_PAGES ?? '5', 10), 10)  // hard cap at 10
const PER_PAGE_TIMEOUT_MS = 90_000       // 90s per page
const TOTAL_CRAWL_TIMEOUT_MS = 480_000   // 8 minutes total
```

**Idempotency check pattern** (lines 10-18 of existing file — copy unchanged):
```typescript
const job = await prisma.job.findUnique({ where: { id: jobId }, select: { status: true } })
if (!job) {
  console.warn(`[processor] Job ${jobId} not found — discarding`)
  return
}
if (job.status !== 'pending') {
  console.warn(`[processor] Job ${jobId} already ${job.status} — discarding duplicate delivery`)
  return
}
```

**Error handling pattern** (lines 53-59 of existing file — copy unchanged for outer catch):
```typescript
} catch (err) {
  const message = err instanceof Error ? err.message : 'Unknown crawler error'
  console.error(`[processor] Job ${jobId} failed:`, message)
  await prisma.job.update({
    where: { id: jobId },
    data: { status: 'failed', error_message: message.slice(0, 500) },
  })
}
```

**Core multi-page loop pattern** (replaces lines 22-51 of existing file):
```typescript
const allPageResults: PageAnalysisResult[] = []

try {
  await prisma.job.update({ where: { id: jobId }, data: { status: 'crawling' } })

  // Page 1: root URL — also discovers links
  const rootResult = await withTimeout(
    crawlAndAnalyzePage(jobId, url, 0),
    PER_PAGE_TIMEOUT_MS,
    `Root page crawl exceeded ${PER_PAGE_TIMEOUT_MS}ms`
  )
  allPageResults.push(rootResult)

  // Discover additional pages — exclude root URL itself to avoid duplicate
  const normalizedRoot = url.split('#')[0].replace(/\/$/, '')
  const additionalUrls = (rootResult.discoveredLinks ?? [])
    .filter(u => u !== normalizedRoot)
    .slice(0, MAX_PAGES - 1)

  // Pages 2..N: sequential crawl with per-page error isolation
  for (let i = 0; i < additionalUrls.length; i++) {
    const pageUrl = additionalUrls[i]
    try {
      const pageResult = await withTimeout(
        crawlAndAnalyzePage(jobId, pageUrl, i + 1),
        PER_PAGE_TIMEOUT_MS,
        `Page ${i + 1} crawl exceeded ${PER_PAGE_TIMEOUT_MS}ms`
      )
      allPageResults.push(pageResult)
    } catch (pageErr) {
      // Per-page failure is non-blocking — log and continue with remaining pages
      console.warn(`[processor] Job ${jobId}: page ${pageUrl} failed — continuing`, pageErr)
    }
  }

  await prisma.job.update({ where: { id: jobId }, data: { status: 'analyzing' } })

  // Stage 4: site-wide merge (after all per-page stages complete)
  const client = getGroqClient()
  const siteWideNarrative = await runSiteWideAnalysis(client, allPageResults)

  // Atomic DB write: one Result (site-wide) + N CrawledPage records
  await writeCrawlResults(jobId, allPageResults, siteWideNarrative)

  await prisma.job.update({ where: { id: jobId }, data: { status: 'complete' } })
  console.log(`[processor] Job ${jobId} completed in ${Date.now() - startedAt}ms`)
```

**`withTimeout` helper** — add as module-level function:
```typescript
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ])
}
```

---

### `crawler/src/pipeline/run-pipeline.ts` — add `mode` param + `PipelineResult` return

**Analog:** `crawler/src/pipeline/run-pipeline.ts` (the file itself; add `mode` param + conditional return)

**New signature** — modify existing `export async function runAIPipeline` (line 44):
```typescript
export async function runAIPipeline(
  jobId: string,
  signals: { mobile: CrawlPass; desktop: CrawlPass },
  screenshot: Buffer | null,
  techProfile: TechProfile,
  externalSignals: ExternalSignals | null,
  mode: 'single' | 'multi' = 'single',  // NEW — defaults to 'single' for backward compat
): Promise<void | PipelineResult>        // NEW — returns PipelineResult in 'multi' mode
```

**Multi-mode branch** — replace the final `prisma.$transaction` block (lines 119-178) with:
```typescript
if (mode === 'single') {
  // ... existing prisma.$transaction block unchanged (lines 119-178) ...
  return
}

// multi mode: return result object instead of writing to DB
return {
  enrichedIssues,
  edges,
  narrative,
  screenshotUrl,
  techProfile,
  pageType,
}
```

**Import addition** — add to top of file:
```typescript
import type { PipelineResult } from './types'
```

**Zero-issues path in multi mode** (after line 98, add multi-mode return):
```typescript
if (scoredIssues.length === 0) {
  if (mode === 'single') {
    await prisma.result.create({ /* ... existing ... */ })
    return
  }
  // multi mode: return empty result
  return {
    enrichedIssues: [],
    edges: [],
    narrative: {
      summary: 'No significant issues found.',
      perceivedPerformance: '',
      technicalPerformance: '',
      recommendations: [],
    },
    screenshotUrl,
    techProfile,
    pageType: detectPageType(techProfile, signals.desktop.domSignals),
  }
}
```

---

### `crawler/src/pipeline/types.ts` — add new types

**Analog:** `crawler/src/pipeline/types.ts` (the file itself; append new interfaces at the end)

**Existing types to reference** (lines 1-46 — used verbatim in new types):
```typescript
// Existing: ScoredIssue, EnrichedIssue, CausalEdgeCandidate, NarrativeResult
// New types follow the same doc-comment + interface pattern
```

**New types to append** (after the existing `PERMITTED_MECHANISMS` const at line 51):
```typescript
// Phase 8: per-page result container (returned by runAIPipeline in 'multi' mode)
export interface PipelineResult {
  enrichedIssues: EnrichedIssue[]
  edges: CausalEdgeCandidate[]
  narrative: NarrativeResult
  screenshotUrl: string | null
  techProfile: TechProfile                  // import TechProfile from '../lib/types'
  pageType: PageType                         // import PageType from './page-type-detector'
}

// Phase 8: full result for one crawled page including discovered links
export interface PageAnalysisResult {
  url: string
  pageIndex: number
  enrichedIssues: EnrichedIssue[]
  edges: CausalEdgeCandidate[]
  narrative: NarrativeResult
  screenshotUrl: string | null
  techProfile: TechProfile
  pageType: PageType
  discoveredLinks: string[]                  // populated for page 0 (root); empty for subsequent pages
}

// Phase 8: a signal_source pattern that appears across multiple crawled pages
export interface CrossPagePattern {
  signal_source: string
  page_count: number
  worst_severity: number
  affected_urls: string[]
  representative_evidence: string
}

// Phase 8: site-wide narrative produced by Stage 4 LLM call
export interface SiteWideNarrative {
  narrative: NarrativeResult
  crossPagePatterns: CrossPagePattern[]
}
```

---

### `crawler/src/lib/types.ts` — extend `CrawlPass`

**Analog:** `crawler/src/lib/types.ts` (the file itself; single field addition)

**Existing `CrawlPass` interface** (lines 102-113 — add one field):
```typescript
export interface CrawlPass {
  viewport: 'mobile' | 'desktop'
  domSignals: DOMSignals
  cssSignals: CSSSignals
  jsSignals: JSSignals
  networkSignals: NetworkSignals
  screenshot?: Buffer
  browserFingerprint?: BrowserFingerprint
  axeViolations?: AxeViolation[]
  internalLinks?: string[]  // NEW — desktop pass only; populated by extractInternalLinks()
}
```

**Critical constraint:** `internalLinks` must be optional (`?`) because the mobile pass never runs `extractInternalLinks`. Callers read it as `desktop.internalLinks ?? []`.

---

### `prisma/schema.prisma` — add `CrawledPage` models + `Result.crawledPages` relation

**Analog:** Existing `Issue` and `CausalEdge` model patterns (lines 50-77)

**Pattern from `Issue` model** (lines 50-63 — mirror field layout for `CrawledPageIssue`):
```prisma
model Issue {
  id                     String       @id @default(cuid())
  resultId               String
  result                 Result       @relation(fields: [resultId], references: [id])
  category               String
  signal_source          String
  severity               Int
  raw_evidence           String
  technical_description  String
  fix_suggestion         String       @default("")
  severity_justification String       @default("")
  causedBy               CausalEdge[] @relation("ToIssue")
  causes                 CausalEdge[] @relation("FromIssue")
}
```

**Pattern from `CausalEdge` model** (lines 65-77 — mirror for `CrawledPageEdge`):
```prisma
model CausalEdge {
  id           String @id @default(cuid())
  resultId     String
  result       Result @relation(fields: [resultId], references: [id])
  fromIssueId  String
  // ... relation fields with named relation strings
  mechanism    String // NON-NULLABLE — copy this constraint for CrawledPageEdge
  explanation  String
}
```

**Addition to `Result` model** (after `edges CausalEdge[]` on line 46):
```prisma
model Result {
  // ... all existing fields unchanged ...
  crawledPages   CrawledPage[]      // NEW: empty for pre-Phase-8 jobs; backward compatible
  cross_page_patterns Json?         // NEW: CrossPagePattern[] serialized; nullable for backward compat
}
```

**New models to append** (after existing `CausalEdge` model):
```prisma
// SYNC: keep CrawledPageIssue in sync with Issue model field list
model CrawledPage {
  id             String             @id @default(cuid())
  resultId       String
  result         Result             @relation(fields: [resultId], references: [id])
  url            String
  page_index     Int
  narrative      Json
  screenshot_url String?
  tech_stack     Json?
  issues         CrawledPageIssue[]
  edges          CrawledPageEdge[]
  created_at     DateTime           @default(now())

  @@index([resultId])
}

// SYNC: keep in sync with Issue model
model CrawledPageIssue {
  id                     String            @id @default(cuid())
  crawledPageId          String
  crawledPage            CrawledPage       @relation(fields: [crawledPageId], references: [id])
  category               String
  signal_source          String
  severity               Int
  raw_evidence           String
  technical_description  String
  fix_suggestion         String            @default("")
  severity_justification String            @default("")
  causedBy               CrawledPageEdge[] @relation("ToCrawledPageIssue")
  causes                 CrawledPageEdge[] @relation("FromCrawledPageIssue")
}

// SYNC: keep in sync with CausalEdge model
model CrawledPageEdge {
  id              String           @id @default(cuid())
  crawledPageId   String
  crawledPage     CrawledPage      @relation(fields: [crawledPageId], references: [id])
  fromIssueId     String
  fromIssue       CrawledPageIssue @relation("FromCrawledPageIssue", fields: [fromIssueId], references: [id])
  toIssueId       String
  toIssue         CrawledPageIssue @relation("ToCrawledPageIssue", fields: [toIssueId], references: [id])
  relationship    String
  confidence      String
  mechanism       String
  explanation     String
}
```

**Critical constraint:** Use `npm run db:migrate` (NOT `db:push`) to generate a named migration file. The `cross_page_patterns Json?` column is nullable — safe migration, no data backfill needed.

---

### `crawler/prisma/schema.prisma` — sync copy

**Analog:** `crawler/prisma/schema.prisma` itself (always a copy of root, with two header differences)

**Two differences to preserve** (lines 1-16 of existing file):
```prisma
// generator output: "../src/generated/prisma"  (resolves to crawler/src/generated/prisma)
// datasource url: env("DATABASE_URL")           (crawler has no prisma.config.ts)
```

All model additions from `prisma/schema.prisma` are copied verbatim into this file. Do not change the `generator` or `datasource` blocks.

---

### `src/app/results/[jobId]/page.tsx` — add `crawledPages` query + accordion render

**Analog:** `src/app/results/[jobId]/page.tsx` (the file itself; extension at existing Prisma query and JSX)

**Extended Prisma query** (replace lines 58-65):
```typescript
const result = await prisma.result.findUnique({
  where: { jobId },
  include: {
    job: true,
    issues: { orderBy: { severity: 'desc' } },
    edges: true,
    crawledPages: {              // NEW
      orderBy: { page_index: 'asc' },
      include: {
        issues: { orderBy: { severity: 'desc' } },
        edges: true,
      },
    },
  },
})
```

**New import** (add to existing import block at top of file):
```typescript
import { PageAccordionSection } from '@/components/PageAccordionSection'
```

**New JSX section** (insert AFTER the existing "Section 6 — Causality graph" block, before `</main>`):
```tsx
{/* Section 7 — Per-page breakdown (multi-page crawl only) */}
{result.crawledPages.length > 0 && (
  <div className="mt-8">
    <h2 className="text-base font-semibold text-slate-100 mb-1">Per-page Breakdown</h2>
    <p className="text-sm text-slate-500 mb-4">
      {result.crawledPages.length} page{result.crawledPages.length !== 1 ? 's' : ''} crawled
    </p>
    <div className="space-y-3">
      {result.crawledPages.map((page) => (
        <PageAccordionSection key={page.id} page={page} defaultOpen={page.page_index === 0} />
      ))}
    </div>
  </div>
)}
```

**Backward compatibility:** `result.crawledPages` is always included in the query (Prisma returns `[]` for pre-Phase-8 rows). The `length > 0` guard hides the accordion for historical jobs — no change to existing rendering.

---

### `crawler/src/pipeline/site-wide-merger.ts` — NEW Stage 4 file

**Analog:** `crawler/src/pipeline/stage3-narrator.ts` (same role: LLM call returning structured result)

**Imports pattern** (mirror stage3-narrator.ts lines 1-4):
```typescript
// Stage 4: site-wide merger — cross-page pattern detection + site-wide LLM narrative.
import Groq from 'groq-sdk'
import type { PageAnalysisResult, SiteWideNarrative, CrossPagePattern } from './types'
import type { NarrativeResult } from './types'
```

**No Zod for Stage 4** — Stage 3 uses free-text parsing (`parseNarrativeOutput`), not Zod forced tool call. Stage 4 should use the same free-text parsing approach for the site-wide narrative (Stage 3 pattern), not the forced tool call approach of Stage 2. This stays within the 12,000 TPM limit more easily.

**Deterministic `detectCrossPagePatterns` function** (pure function — no LLM, no Groq):
```typescript
export function detectCrossPagePatterns(
  pageResults: PageAnalysisResult[],
  minPages: number = 3,
): CrossPagePattern[] {
  const bySignalSource = new Map<string, {
    urls: string[]
    maxSeverity: number
    evidence: string
  }>()

  for (const page of pageResults) {
    for (const issue of page.enrichedIssues) {
      const existing = bySignalSource.get(issue.signal_source)
      if (existing) {
        existing.urls.push(page.url)
        if (issue.severity > existing.maxSeverity) {
          existing.maxSeverity = issue.severity
          existing.evidence = issue.raw_evidence
        }
      } else {
        bySignalSource.set(issue.signal_source, {
          urls: [page.url],
          maxSeverity: issue.severity,
          evidence: issue.raw_evidence,
        })
      }
    }
  }

  return Array.from(bySignalSource.entries())
    .filter(([, v]) => v.urls.length >= minPages)
    .map(([signal_source, v]) => ({
      signal_source,
      page_count: v.urls.length,
      worst_severity: v.maxSeverity,
      affected_urls: v.urls,
      representative_evidence: v.evidence,
    }))
    .sort((a, b) => b.worst_severity - a.worst_severity || b.page_count - a.page_count)
}
```

**`runSiteWideAnalysis` LLM call pattern** (mirror `runStage3Narration` from stage3-narrator.ts lines 72-106):
```typescript
export async function runSiteWideAnalysis(
  client: Groq,
  pageResults: PageAnalysisResult[],
): Promise<SiteWideNarrative> {
  const crossPagePatterns = detectCrossPagePatterns(pageResults)

  // If only 1 page: skip LLM call, return per-page narrative directly
  if (pageResults.length === 1) {
    return {
      narrative: pageResults[0].narrative,
      crossPagePatterns: [],
    }
  }

  // Build compact per-page summaries to stay within 12,000 TPM Groq free tier limit
  const pageSummaries = pageResults.map((p, i) => ({
    index: i,
    url: p.url,
    pageType: p.pageType,
    topIssues: p.enrichedIssues
      .sort((a, b) => b.severity - a.severity)
      .slice(0, 5)
      .map(issue => `[sev ${issue.severity}] ${issue.signal_source}: ${issue.raw_evidence}`),
    narrative_summary: p.narrative.summary,
  }))

  const systemPrompt = `...` // see RESEARCH.md Pattern 4 for prompt text
  const userPrompt = `Analyze ${pageResults.length} pages.\n\nPage summaries:\n${JSON.stringify(pageSummaries, null, 2)}`

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',  // same model as Stage 3
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 1024,  // same cap as Stage 3
  })

  const text = response.choices[0]?.message?.content ?? ''
  // Reuse existing parseNarrativeOutput from stage3-narrator.ts — same [SECTION] format
  const { parseNarrativeOutput } = await import('./stage3-narrator')
  const narrative = parseNarrativeOutput(text)

  return { narrative, crossPagePatterns }
}
```

**Critical constraint:** Input to LLM is per-page SUMMARIES only (top 5 issues + narrative summary string), NOT full `EnrichedIssue[]` arrays. Full arrays for 5 pages × 20 issues = 100 issues × ~200 tokens = 20,000 tokens, exceeding Groq's 12,000 TPM free tier limit.

---

### `crawler/src/pipeline/site-wide-merger.test.ts` — NEW unit test file

**Analog:** `crawler/src/pipeline/stage3-narrator.test.ts` (structure) + `crawler/src/pipeline/stage1-5-vision-scanner.test.ts` (mock Groq pattern)

**File header pattern** (line 1-4 of stage3-narrator.test.ts):
```typescript
// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'
import { detectCrossPagePatterns, runSiteWideAnalysis } from './site-wide-merger'
import type { PageAnalysisResult } from './types'
```

**Fixture builder pattern** (copy from stage1-scorer.test.ts lines 10-62 — build a `makePageResult` helper):
```typescript
function makePageResult(url: string, pageIndex: number, overrides: {
  enrichedIssues?: PageAnalysisResult['enrichedIssues']
} = {}): PageAnalysisResult {
  return {
    url,
    pageIndex,
    enrichedIssues: overrides.enrichedIssues ?? [],
    edges: [],
    narrative: {
      summary: `Summary for ${url}`,
      perceivedPerformance: '',
      technicalPerformance: '',
      recommendations: [],
    },
    screenshotUrl: null,
    techProfile: { /* minimal TechProfile */ } as any,
    pageType: 'unknown',
    discoveredLinks: [],
  }
}
```

**Test describe structure** (mirror stage3-narrator.test.ts lines 48-135):
```typescript
describe('detectCrossPagePatterns', () => {
  describe('CRAWL-02: threshold filtering', () => {
    it('returns patterns for signal_sources appearing on >= minPages pages', ...)
    it('returns empty array when no signal_source meets threshold', ...)
    it('sorts results by worst_severity descending', ...)
    it('includes affected_urls for each pattern', ...)
    it('uses most-severe occurrence as representative_evidence', ...)
  })
})

describe('runSiteWideAnalysis', () => {
  it('returns per-page narrative directly when pageResults.length === 1', ...)
  it('returns SiteWideNarrative with crossPagePatterns array', ...)
  // Mock Groq for LLM call tests (see vision-scanner.test.ts vi.mock pattern)
})
```

---

### `crawler/src/browser.test.ts` — NEW unit test file

**Analog:** `crawler/src/pipeline/stage1-scorer.test.ts` (pure function fixture pattern; no mock needed for `detectCrossPagePatterns`-style tests, but `page.evaluate` must be mocked for `extractInternalLinks`)

**File header** (mirror stage1-scorer.test.ts line 1-4):
```typescript
// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'
import { extractInternalLinks } from './browser'
```

**Mock `page.evaluate`** (the function takes a Playwright `Page` object; mock with minimal interface):
```typescript
function makeMockPage(hrefs: (string | null)[]): { evaluate: () => Promise<(string | null)[]> } {
  return {
    evaluate: vi.fn().mockResolvedValue(hrefs),
  }
}
```

**Test structure** (test IDs from RESEARCH.md Validation Architecture):
```typescript
describe('extractInternalLinks', () => {
  it('CRAWL-01: returns only same-origin links', ...)
  it('CRAWL-01: excludes fragment-only hrefs (#section)', ...)
  it('CRAWL-01: excludes mailto: and tel: hrefs', ...)
  it('CRAWL-01: deduplicates URLs (returns Set-like result)', ...)
  it('CRAWL-01: normalizes relative paths to absolute URLs', ...)
  it('CRAWL-01: excludes the root URL itself (caller responsibility, but verify filter behavior)', ...)
  it('CRAWL-01: skips malformed hrefs without throwing', ...)
})
```

---

### `src/components/PageAccordionSection.tsx` — NEW Client Component

**Analog:** `src/components/ShareButton.tsx` (client component with `useState` toggle) + `src/components/NarrativeSection.tsx` (card layout, dark theme, Tailwind class conventions)

**File header pattern** (line 1 of ShareButton.tsx — `"use client"` must be first line):
```typescript
'use client'
import { useState } from 'react'
```

**Imports pattern** (mirror results page component imports for types):
```typescript
import { IssueCard } from './IssueCard'
import { NarrativeSection } from './NarrativeSection'
import type { NarrativeResult } from '@/types/narrative'
```

**Props interface** — typed from Prisma query shape (crawledPages include):
```typescript
interface PageAccordionSectionProps {
  page: {
    id: string
    url: string
    page_index: number
    narrative: unknown               // Prisma Json — cast to NarrativeResult inside component
    screenshot_url: string | null
    issues: {
      id: string
      category: string
      signal_source: string
      severity: number
      raw_evidence: string
      technical_description: string
      fix_suggestion: string
      severity_justification: string
    }[]
    edges: unknown[]
  }
  defaultOpen?: boolean              // page_index === 0 opens by default
}
```

**Accordion toggle pattern** (copy state pattern from ShareButton.tsx lines 5-6):
```typescript
export function PageAccordionSection({ page, defaultOpen = false }: PageAccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const narrative = page.narrative as unknown as NarrativeResult

  // ...
}
```

**Dark theme card pattern** (copy class conventions from NarrativeSection.tsx lines 6-11):
```tsx
<div className="rounded-xl bg-[#131f35] border border-white/[0.08] overflow-hidden">
  {/* Header — clickable accordion trigger */}
  <button
    onClick={() => setIsOpen(!isOpen)}
    className="w-full px-5 py-3.5 border-b border-white/[0.07] flex items-center justify-between text-left"
  >
    {/* URL label on left, chevron on right */}
  </button>

  {/* Collapsible body */}
  {isOpen && (
    <div className="px-5 py-5 space-y-4">
      <NarrativeSection narrative={narrative} />
      <div className="mt-6">
        {page.issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
      </div>
    </div>
  )}
</div>
```

**Critical constraint:** `"use client"` must appear on line 1 (before any imports). The accordion toggle is the only reason this is a Client Component — `NarrativeSection` and `IssueCard` are Server Component-safe but are used inside a Client Component here, which is valid.

---

## Shared Patterns

### Groq client pattern
**Source:** `crawler/src/lib/groq-client.ts`
**Apply to:** `site-wide-merger.ts`
```typescript
import { getGroqClient } from '../lib/groq-client'
const client = getGroqClient()
```

### LLM call pattern (free-text, no forced tool call)
**Source:** `crawler/src/pipeline/stage3-narrator.ts` (lines 94-106)
**Apply to:** `site-wide-merger.ts` `runSiteWideAnalysis`
```typescript
const response = await client.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ],
  max_tokens: 1024,
})
const text = response.choices[0]?.message?.content ?? ''
```

### Prisma JSON cast pattern
**Source:** `crawler/src/pipeline/run-pipeline.ts` (line 123) and `src/app/results/[jobId]/page.tsx` (line 115)
**Apply to:** `PageAccordionSection.tsx`, `processor.ts` (when writing `CrawledPage.narrative`)
```typescript
const narrativeJson = narrative as unknown as Parameters<typeof tx.result.create>[0]['data']['narrative']
// Reading side:
const narrative = result.narrative as unknown as NarrativeResult
```

### Dark theme card shell
**Source:** `src/components/NarrativeSection.tsx` (lines 6-11)
**Apply to:** `PageAccordionSection.tsx`
```tsx
className="rounded-xl bg-[#131f35] border border-white/[0.08] overflow-hidden"
```

### Vitest test file header
**Source:** `crawler/src/pipeline/stage3-narrator.test.ts` (line 1)
**Apply to:** `site-wide-merger.test.ts`, `browser.test.ts`
```typescript
// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'
```

### `console.log` log prefix convention
**Source:** `crawler/src/processor.ts` (line 51), `crawler/src/pipeline/run-pipeline.ts` (line 57)
**Apply to:** `processor.ts` multi-page loop, `site-wide-merger.ts`
```typescript
// Format: [module] descriptive message with ${variable} interpolation
console.log(`[processor] Job ${jobId} completed in ${Date.now() - startedAt}ms`)
console.log(`[pipeline] Stage 4: site-wide analysis for ${pageResults.length} pages`)
```

---

## No Analog Found

All files have close analogs in the codebase. No files require pattern invention from scratch.

---

## Metadata

**Analog search scope:** `crawler/src/`, `src/app/results/`, `src/components/`, `prisma/`
**Files read:** 14
**Pattern extraction date:** 2026-05-28
