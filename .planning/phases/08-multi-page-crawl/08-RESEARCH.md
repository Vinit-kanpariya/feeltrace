# Phase 8: Multi-page Crawl — Research

**Researched:** 2026-05-28
**Domain:** Web link discovery, multi-page crawl orchestration, Prisma schema extension, AI pipeline aggregation, UI tab/accordion layout for per-page results
**Confidence:** HIGH for architecture and schema decisions (derived from existing codebase); MEDIUM for QStash timeout math (plan-specific; confirmed free tier is 15 minutes); LOW for cross-page LLM merge prompt design (novel pattern, no authoritative prior art in project)

---

## Summary

Phase 8 extends the single-URL crawl pipeline into a multi-page crawl. The core challenge is threefold: (1) discover and filter internal links during the existing Playwright crawl without a second browser launch, (2) loop `runDualViewportCrawl` + `runAIPipeline` over N discovered URLs sequentially, and (3) produce a unified site-wide narrative by aggregating per-page `EnrichedIssue[]` arrays across all crawled pages.

The existing architecture supports this extension cleanly. The `processJob` function in `processor.ts` is the right place to add the multi-page loop — it owns the job lifecycle. The `runDualViewportCrawl` function in `browser.ts` already performs per-URL crawls; calling it N times is safe. The `runAIPipeline` function in `run-pipeline.ts` needs to be split: per-page analysis runs unchanged per page, and a new `runSiteWideAnalysis` function merges the results. The schema needs one new model (`CrawledPage`) to hold per-page results, while the existing `Result` model becomes the site-wide aggregate container.

The most important design decision is **one QStash job per multi-page crawl session** (not one per page). The current single-job model is preserved: QStash delivers one message per user submission, the crawler processes up to N pages sequentially under that single job, and the final DB write writes all per-page results plus the merged site-wide result atomically. This avoids QStash fan-out complexity and keeps the existing `/results/[jobId]` URL pattern.

**Primary recommendation:** Extend `processor.ts` with a sequential page loop, add a `CrawledPage` model to Prisma, run the 3-stage AI pipeline per page, add a new Stage 4 site-wide merger LLM call, and render per-page results as collapsible accordion sections under the site-wide summary in the existing results page.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CRAWL-01 | System auto-discovers internal links from the root URL and crawls up to a configurable max number of pages (default: 5) | Link extraction via `page.evaluate()` in `crawlWithViewport`; same-origin URL constructor filtering; `MAX_PAGES` env var; dedup via `Set<string>`; sequential loop in `processJob` |
| CRAWL-02 | System merges signals from all crawled pages into a unified site-wide analysis with cross-page pattern detection | New Stage 4 LLM call (`runSiteWideAnalysis`) accepting per-page `EnrichedIssue[][]`; cross-page pattern detection by grouping issues by `signal_source`; site-wide `narrative` written to existing `Result.narrative` JSON column |
| CRAWL-03 | Results UI shows per-page breakdowns alongside the site-wide summary | `CrawledPage` records store per-page narrative + issues; results page renders site-wide summary first, then an accordion of per-page sections; `IssueCard` reused unchanged |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Internal link discovery (CRAWL-01) | Crawler (`browser.ts`) | — | Links are extracted inside the Playwright browser session; extraction happens naturally at the end of the desktop crawl pass before `context.close()` |
| Multi-page loop orchestration (CRAWL-01) | Crawler (`processor.ts`) | — | `processJob` owns the job lifecycle; extending it with a page loop keeps the SLA budget check and job status updates in one place |
| Per-page AI pipeline (CRAWL-02) | Crawler (`run-pipeline.ts`) | — | `runAIPipeline` is already per-URL; calling it N times is the simplest extension |
| Site-wide narrative merge (CRAWL-02) | Crawler (`run-pipeline.ts` Stage 4) | — | Merger sees all per-page `EnrichedIssue[]` arrays; belongs in the pipeline not the DB write |
| Per-page schema storage (CRAWL-03) | Prisma (`CrawledPage` model) | — | Existing `Result` model becomes the site-wide container; `CrawledPage` records hold per-page issues + narrative |
| Per-page breakdown UI (CRAWL-03) | Next.js app (results page) | — | `result.crawledPages` queried in the existing `prisma.result.findUnique` call; rendered as accordion |
| Regression: single-URL mode | Crawler (`processor.ts`) | — | `crawledPages.length === 1` is equivalent to single-URL; no code branches needed — the loop runs once |

---

## Standard Stack

### Core (all already installed — no new packages required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `playwright-core` | 1.60.0 | Browser automation — already used; link extraction added to existing crawl pass | Already in `crawler/package.json`; `page.evaluate()` for link extraction is idiomatic |
| `@prisma/client` + `prisma` | 7.8.0 | ORM — new `CrawledPage` model added to existing schema | Already in both `package.json` files; project-standard DB access layer |
| `groq-sdk` | ^1.2.0 | Stage 4 site-wide LLM merge call — same client as Stages 2/3 | Already installed; same free-tier model `llama-3.3-70b-versatile` |
| `zod` | 4.4.3 | Schema validation for Stage 4 LLM output | Already installed; project-standard for all LLM output validation |
| `p-queue` | 9.3.0 | Concurrency control — no change; crawl loop runs inside single job slot | Already installed; concurrency: 1 ensures sequential page processing |

### No New Packages Required

Phase 8 introduces no new npm dependencies. All link extraction, crawl orchestration, AI pipeline extension, and DB operations use already-installed libraries.

**Installation:** No `sfw npm install` commands required for this phase.

---

## Package Legitimacy Audit

Phase 8 installs no new packages. All required libraries are already in `crawler/package.json` and the root `package.json`.

**Packages removed due to slopcheck verdict:** none
**Packages flagged as suspicious:** none

---

## Architecture Patterns

### System Architecture Diagram

```
User submits URL
       │
       ▼
POST /api/analyze → create Job → QStash publish (one message per submission)
       │
       ▼ (QStash delivers to /crawl on Railway crawler)
processJob(jobId, rootUrl)
       │
       ├── Step 1: Crawl root URL (runDualViewportCrawl)
       │         └── Extract internal links → LinkSet (same-origin, deduped)
       │
       ├── Step 2: Select up to MAX_PAGES-1 additional pages from LinkSet
       │
       ├── Step 3: For each selected page URL (sequential):
       │         ├── runDualViewportCrawl(pageUrl)
       │         ├── fetchPSISignals(pageUrl) [parallel with crawl, 30s timeout]
       │         └── runAIPipeline(pageUrl signals) → EnrichedIssue[] + NarrativeResult
       │
       ├── Step 4: runSiteWideAnalysis(allPageResults[])
       │         └── Stage 4 LLM call → SiteWideNarrative
       │         (cross-page pattern detection: group by signal_source, find issues
       │          appearing on 3+ pages = site-wide pattern)
       │
       └── Step 5: Atomic DB write
                 ├── Result (site-wide narrative, screenshot of root page)
                 └── CrawledPage[] (per-page: url, narrative, issues, edges, screenshot_url)
                        └── Issue[] per page (with fix_suggestion, severity_justification)

       ▼
/results/[jobId] (Next.js)
       ├── Site-wide summary section (NarrativeSection)
       ├── Site-wide cross-page patterns block (new)
       └── Per-page accordion (one section per CrawledPage)
               └── Per-page IssueCard[] (unchanged component)
```

### Recommended Project Structure (changes only)

```
crawler/src/
├── browser.ts                        # MODIFIED: extractInternalLinks() added
├── processor.ts                      # MODIFIED: multi-page loop, site-wide merge call
├── pipeline/
│   ├── run-pipeline.ts               # MODIFIED: accept pageUrl param; return EnrichedResult
│   ├── site-wide-merger.ts           # NEW: Stage 4 LLM call + cross-page pattern detection
│   ├── site-wide-merger.test.ts      # NEW: unit tests for pattern detection + merge
│   └── types.ts                      # MODIFIED: PageAnalysisResult, SiteWideNarrative types
prisma/
└── schema.prisma                     # MODIFIED: CrawledPage model + Result relation
crawler/prisma/
└── schema.prisma                     # MODIFIED: kept in sync with root
src/
└── app/results/[jobId]/
    └── page.tsx                      # MODIFIED: per-page accordion + site-wide patterns block
```

### Pattern 1: Internal Link Extraction (CRAWL-01)

**What:** Extract all `<a href>` elements from the desktop Playwright page, normalize relative paths, filter to same-origin only, deduplicate, exclude fragment-only and non-HTTP links.

**When to use:** At the end of `crawlWithViewport` for the desktop pass only, before `context.close()`. The function already has access to `page` at this point.

**Key constraint:** Link extraction must happen BEFORE `context.close()` — after that call, `page` is invalidated.

```typescript
// Source: Playwright docs (playwright.dev/docs/evaluating) + Checkly guide
// crawler/src/browser.ts — inside crawlWithViewport, desktop pass only

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
      // Strip fragment — treat /about and /about#section as same page
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

  return links  // caller selects up to MAX_PAGES - 1
}
```

**robots.txt:** Playwright has no built-in robots.txt enforcement. For Phase 8, robots.txt checking is intentionally omitted — FeelTrace is a first-party UX analysis tool used by site owners on their own properties. Site owners crawling their own site have no need to obey robots.txt. [ASSUMED — design decision; if FeelTrace later allows third-party analysis, robots.txt compliance becomes a requirement]

**Crawl ordering:** Prioritize shorter paths over longer ones (sort by path depth = number of `/` characters) to favor main navigation pages over deeply nested content pages. This approximates crawling the most user-visible pages first. [ASSUMED — heuristic; no authoritative guidance for UX analysis use case]

```typescript
// Sort: shorter paths first (more likely to be key user-facing pages)
links.sort((a, b) => {
  const depthA = new URL(a).pathname.split('/').filter(Boolean).length
  const depthB = new URL(b).pathname.split('/').filter(Boolean).length
  return depthA - depthB
})
return links.slice(0, maxPages - 1)  // -1 because root page is already crawled
```

### Pattern 2: Multi-page Loop in processor.ts (CRAWL-01)

**What:** Extend `processJob` to loop over discovered pages. The root URL is always crawled first (provides the link set). Additional pages are crawled sequentially using the same `runDualViewportCrawl` + `fetchPSISignals` pattern.

**Key constraint:** The entire loop must complete within the QStash timeout. QStash free tier supports 15-minute HTTP response durations [VERIFIED: upstash.com/pricing/qstash]. With a per-page budget of ~45s (20s crawl + 20s PSI + 5s AI), 5 pages × 45s = 225s (3.75 minutes). This is comfortably within the 15-minute QStash free tier limit. The existing 55s SLA from `processor.ts` applies only to the single-page case and must be removed or extended for multi-page.

**SLA budget per page:**
- `runDualViewportCrawl`: ~15-25s (measured in single-URL mode)
- `fetchPSISignals`: ~10-40s (30s hard timeout; runs parallel with crawl already)
- `runAIPipeline` (Stage 1 + 1.5 + 2 + 3): ~5-15s (3 LLM calls at Groq free tier)
- Total per page: ~30-80s worst case, ~45s typical
- Total for 5 pages: ~150-400s worst case, ~225s typical

**Revised SLA:** Replace the 55s `SLA_MS` with a per-page timeout of 90s and a total crawl timeout of 8 minutes (480s). This leaves 7 minutes of headroom below QStash's 15-minute free tier limit. [ASSUMED — 90s per-page and 8min total are reasonable starting values; production tuning may be needed]

```typescript
// crawler/src/processor.ts (modified)
const MAX_PAGES = parseInt(process.env.MAX_CRAWL_PAGES ?? '5', 10)
const PER_PAGE_TIMEOUT_MS = 90_000      // 90s per page
const TOTAL_CRAWL_TIMEOUT_MS = 480_000  // 8 minutes total

export async function processJob(jobId: string, url: string): Promise<void> {
  // ... existing idempotency check unchanged ...

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

    // Discover additional pages from root crawl
    const additionalUrls = rootResult.discoveredLinks.slice(0, MAX_PAGES - 1)

    // Pages 2..N: sequential crawl
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

    // Stage 4: site-wide merge
    const client = getGroqClient()
    const siteWideNarrative = await runSiteWideAnalysis(client, allPageResults)

    // Atomic DB write
    await writeCrawlResults(jobId, allPageResults, siteWideNarrative)

    await prisma.job.update({ where: { id: jobId }, data: { status: 'complete' } })
  } catch (err) {
    // ... existing error handling unchanged ...
  }
}
```

### Pattern 3: runAIPipeline Adapted for Multi-page (CRAWL-02)

**What:** `runAIPipeline` currently writes directly to the DB. For multi-page, it needs to return results instead of writing, so the orchestrator can aggregate before the final DB write. Two options:

- **Option A (recommended):** Add a `mode` param — `mode: 'single'` preserves existing DB-write behavior; `mode: 'multi'` returns `{ enrichedIssues, edges, narrative, screenshot_url }` without writing.
- **Option B:** Split into `runPipelineStages` (compute only, returns result object) and `writePipelineResult` (DB write). Caller always controls when to write.

Option B is cleaner but requires more refactoring. Option A is safer for regression protection (single-URL mode behavior is explicitly unchanged). **Recommend Option A** for Phase 8, with a note to refactor to Option B in a future phase.

```typescript
// pipeline/run-pipeline.ts — new return type for multi-page mode
export interface PipelineResult {
  enrichedIssues: EnrichedIssue[]
  edges: CausalEdgeCandidate[]
  narrative: NarrativeResult
  screenshotUrl: string | null
  techProfile: TechProfile
  pageType: PageType
}

// New signature:
export async function runAIPipeline(
  jobId: string,
  signals: { mobile: CrawlPass; desktop: CrawlPass },
  screenshot: Buffer | null,
  techProfile: TechProfile,
  externalSignals: ExternalSignals | null,
  mode: 'single' | 'multi' = 'single',  // NEW — defaults to single for backward compat
): Promise<void | PipelineResult>
```

For `mode: 'single'`, behavior is exactly as before (writes to DB, returns void). For `mode: 'multi'`, returns `PipelineResult` and skips the DB write. **Single-URL mode is identical to v1.0 when `MAX_CRAWL_PAGES=1` or when link discovery returns 0 additional links.** [ASSUMED — the `mode` parameter approach; the planner may prefer the full split pattern]

### Pattern 4: Stage 4 — Site-Wide Merger LLM Call (CRAWL-02)

**What:** A new LLM call that receives all per-page `EnrichedIssue[]` arrays and their per-page narratives, then produces: (1) a unified site-wide narrative, and (2) cross-page patterns (issues appearing on 3+ pages = a systemic problem).

**Cross-page pattern detection (deterministic, no LLM needed):**

```typescript
// crawler/src/pipeline/site-wide-merger.ts

export interface CrossPagePattern {
  signal_source: string      // e.g. "networkSignals.renderBlockingCount"
  page_count: number         // how many pages show this issue
  worst_severity: number     // max severity across all occurrences
  affected_urls: string[]    // which pages are affected
  representative_evidence: string  // from the most-severe occurrence
}

export function detectCrossPagePatterns(
  pageResults: PageAnalysisResult[],
  minPages: number = 3,  // issue must appear on >= this many pages to be "site-wide"
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

**Stage 4 LLM call — site-wide narrative generation:**

The LLM receives:
- Number of pages crawled and their URLs
- Cross-page patterns (from deterministic detection above)
- Per-page summaries (page type + key issues, not full issue lists — to stay within token budget)
- Per-page narratives from Stage 3

The LLM produces a `SiteWideNarrative` in the same `NarrativeResult` shape (for DB compatibility). The site-wide narrative is stored in `Result.narrative` (existing column). Per-page `NarrativeResult` objects are stored in `CrawledPage.narrative` (new column). [ASSUMED — same JSON shape for site-wide narrative; planner may want a new `SiteWideNarrativeResult` type with additional fields like `cross_page_patterns_summary`]

**Groq rate limit impact of Stage 4:**
- Phase 7 uses 3 LLM calls per single-page job (Stage 1.5 + Stage 2 + Stage 3)
- Phase 8 adds Stage 4 (1 more call per multi-page job)
- For 5-page crawl: 5 × 3 calls + 1 Stage 4 call = 16 LLM calls per job
- At 1,000 RPD free tier: 1,000 / 16 = **62 multi-page jobs per day** before hitting the RPD limit [VERIFIED: console.groq.com/docs/rate-limits — 1,000 RPD for both llama-3.3-70b and llama-4-scout]
- For an MVP, 62 multi-page analyses per day is adequate. Production scale requires a paid Groq plan.

### Pattern 5: Prisma Schema Extension (CRAWL-03)

**What:** Add a `CrawledPage` model to hold per-page results. The existing `Result` model becomes the site-wide container. This is the cleanest option and preserves the existing `Job` → `Result` → `Issue[]` relationship for single-URL backward compatibility.

**Schema changes:**

```prisma
// prisma/schema.prisma — additions

model Result {
  // ... all existing fields unchanged ...
  crawledPages   CrawledPage[]  // NEW: per-page results (empty for historical single-URL jobs)
}

model CrawledPage {
  id             String       @id @default(cuid())
  resultId       String
  result         Result       @relation(fields: [resultId], references: [id])
  url            String                        // the specific page URL crawled
  page_index     Int                           // crawl order (0 = root)
  narrative      Json                          // NarrativeResult — same shape as Result.narrative
  screenshot_url String?                       // per-page screenshot
  tech_stack     Json?                         // per-page TechProfile
  issues         CrawledPageIssue[]
  edges          CrawledPageEdge[]
  created_at     DateTime     @default(now())

  @@index([resultId])
}

model CrawledPageIssue {
  id                     String          @id @default(cuid())
  crawledPageId          String
  crawledPage            CrawledPage     @relation(fields: [crawledPageId], references: [id])
  // Identical fields to Issue model — same AI pipeline output shape
  category               String
  signal_source          String
  severity               Int
  raw_evidence           String
  technical_description  String
  fix_suggestion         String          @default("")
  severity_justification String          @default("")
  causedBy               CrawledPageEdge[] @relation("ToCrawledPageIssue")
  causes                 CrawledPageEdge[] @relation("FromCrawledPageIssue")
}

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

**Migration strategy:** New models — no nullable/non-nullable migration risk on existing tables. `Result.crawledPages` is a relation with no column on `Result` itself (one-to-many via `CrawledPage.resultId`). Existing `Result` rows will simply have zero `CrawledPage` children — backward compatible. Use `db:migrate` (not `db:push`) to generate a proper migration file. [ASSUMED — `db:migrate` is the correct command for production schema changes per CLAUDE.md conventions]

**Alternative considered: embed per-page data in Result.tech_stack Json column.** Rejected because: (1) querying and rendering per-page issues from a JSON blob is complex; (2) Prisma's relational model is the project standard for structured data; (3) IssueCard renders from typed Prisma row objects, not JSON blobs.

**Alternative considered: reuse Issue model with a `page_url` discriminator column.** Rejected because: (1) the Issue model is already referenced by CausalEdge with foreign keys; adding a `page_url` column would conflate site-wide and per-page issues in a single table, requiring query-time filtering everywhere; (2) separate models for `CrawledPageIssue` and `CrawledPageEdge` are explicit and query-efficient.

### Pattern 6: UI — Per-page Accordion (CRAWL-03)

**What:** The results page renders: (1) site-wide summary section (existing `NarrativeSection`, unchanged), (2) cross-page patterns block (new), (3) per-page accordion where each section shows the page URL, its `NarrativeSection`, and its `IssueCard[]` list.

**Why accordion over tabs:** An accordion allows all page sections to be open simultaneously for comparison. Tabs would hide content from view. For 5 pages, an accordion is also more mobile-friendly. [ASSUMED — UX preference; planner may choose tabs]

**`IssueCard` is reused unchanged.** Its `issue` prop shape matches `CrawledPageIssue` exactly (same fields: `id`, `category`, `signal_source`, `severity`, `raw_evidence`, `technical_description`, `fix_suggestion`, `severity_justification`).

**DB query extension:**

```typescript
// src/app/results/[jobId]/page.tsx — extended Prisma query
const result = await prisma.result.findUnique({
  where: { jobId },
  include: {
    job: true,
    issues: { orderBy: { severity: 'desc' } },
    edges: true,
    crawledPages: {           // NEW
      orderBy: { page_index: 'asc' },
      include: {
        issues: { orderBy: { severity: 'desc' } },
        edges: true,
      },
    },
  },
})
```

**Cross-page patterns block:** Rendered between the site-wide narrative and the per-page accordion. Shows a list of `CrossPagePattern` items stored in `Result.narrative` JSON (site-wide narrative includes a `crossPagePatterns` field, or stored as a separate `Result.cross_page_patterns Json?` column — planner's decision). [ASSUMED — cross-page patterns could live in either the narrative JSON or a new column; planner should decide]

**Backward compatibility:** If `result.crawledPages.length === 0` (historical single-URL jobs), the accordion section is simply not rendered. The results page renders identically to Phase 7 behavior for pre-Phase-8 jobs.

### Anti-Patterns to Avoid

- **One QStash job per page:** Fan-out architecture means N QStash messages, N `/crawl` handler invocations, N job records in DB, and complex aggregation. The single-job model is vastly simpler and is sufficient for 5-page crawls.
- **Parallel page crawls:** A single Fly.io container running 5 simultaneous Chromium browsers would need 5× memory (each Chromium instance uses 200-500 MB). At 1 Chromium instance per sequential crawl, memory stays at the existing budget. Do not parallelize unless Fly.io memory is upgraded to 2+ GB.
- **Re-using the `Issue` model for per-page issues:** Adding a `page_url` discriminator to the existing `Issue` model forces every query that reads issues to filter by `page_url IS NULL` for site-wide vs `page_url IS NOT NULL` for per-page. Separate `CrawledPageIssue` and `CrawledPageEdge` models are explicit and query-efficient.
- **Using `db:push` in production for schema changes:** `db:push` does not create migration files and is not safe for production Neon DB changes. Use `db:migrate` to create and apply a named migration.
- **Calling `runAIPipeline` with mode='single' for each page then merging the DB records:** This would create N separate `Result` rows (one per page), breaking the `Job` → `Result` @unique relationship. All pages must write under a single `Result` record.
- **Injecting all per-page EnrichedIssue[] into the Stage 4 LLM call:** For 5 pages × 20 issues each = 100 issues × ~200 tokens each = 20,000 input tokens. This exceeds Groq's 12,000 TPM (tokens per minute) limit on the free tier. Feed only per-page summaries (narrative + top 5 issues by severity) to Stage 4. [VERIFIED: console.groq.com/docs/rate-limits — 12,000 TPM for llama-3.3-70b on free tier]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Internal link extraction | Custom regex on HTML source | `page.evaluate()` with `document.querySelectorAll('a[href]')` inside Playwright browser context | Playwright evaluation runs in the browser, handles relative URLs, JS-rendered links, and base-href correctly |
| URL normalization | Custom string manipulation | `new URL(href, baseUrl).href` + fragment stripping | URL constructor handles relative paths, port normalization, and encoding correctly |
| robots.txt compliance | Custom robots.txt fetcher + parser | Not needed for Phase 8 | FeelTrace users analyze their own sites; first-party tool |
| Cross-page deduplication | Bloom filter or SimHash | Simple `Set<string>` URL dedup | At 5 pages, exact URL matching is sufficient; hash-based dedup would be over-engineering |
| Site-wide narrative generation | Custom template or hand-coded summary | Stage 4 Groq LLM call (same client/model as Stages 2+3) | LLM is already in the pipeline; generating cross-page narrative from structured patterns is exactly what it's good at |
| Concurrency control for page loop | Custom queue | Existing `p-queue` with concurrency: 1 | The multi-page loop runs inside the single p-queue slot; no additional queue needed |

**Key insight:** The multi-page crawl is a mechanical extension of the single-page flow. The hard problems (browser automation, LLM pipeline, DB writes, job status) are all solved. Phase 8 is primarily orchestration: loop + aggregate + new schema + new UI section.

---

## Common Pitfalls

### Pitfall 1: QStash Timeout Exceeded for 5-Page Crawl
**What goes wrong:** The multi-page crawl takes 6+ minutes and QStash aborts the HTTP request after the plan timeout, causing the job to hang in `analyzing` status (no DB write, no failure status update).
**Why it happens:** QStash free tier has a 15-minute maximum HTTP response duration [VERIFIED: upstash.com/pricing/qstash]. If per-page crawls are slow (PSI API at p95 = 40s) and the Groq free tier is rate-limited (429 → retry delay), a 5-page crawl could theoretically take 10+ minutes.
**How to avoid:** (1) Set per-page timeout to 90s; abort that page and continue with remaining pages. (2) Set total crawl timeout to 8 minutes; fail gracefully if reached. (3) Cap MAX_PAGES at 5 — at 8-minute total timeout and 5 pages, budget is 96s per page even in worst case.
**Warning signs:** Job stays in `analyzing` status beyond 10 minutes; no `complete` or `failed` status update.

### Pitfall 2: Link Discovery Returns 0 Links (Root URL is SPA)
**What goes wrong:** `extractInternalLinks` returns an empty array because the page is a SPA that renders navigation links via JavaScript after hydration, or uses `<button>` elements instead of `<a href>` for routing.
**Why it happens:** `page.evaluate()` runs after `waitForSpaHydration`, so hydrated React/Vue links are found. However, some SPAs use `<router-link>` components that render as `<a>` only after initial navigation, or they use `history.pushState` without `<a>` tags.
**How to avoid:** `waitForSpaHydration` already waits for the `domcontentloaded` + 500ms delay. If `extractInternalLinks` returns `[]`, treat it as single-URL mode gracefully (the root page still gets a full analysis). Log the count: `console.log('[browser] Discovered ${links.length} internal links from ${url}')`.
**Warning signs:** All multi-page crawls produce single-page results; check link discovery count in logs.

### Pitfall 3: Groq TPM Limit Hit During Multi-page Stage 4 Call
**What goes wrong:** Stage 4 receives summaries from 5 pages and the input token count (~3,000-5,000 tokens) plus Stage 2+3 calls from the same minute pushes over the 12,000 TPM limit. Groq returns 429 on the Stage 4 call.
**Why it happens:** TPM limits are per-minute windows. A 5-page crawl runs 5× Stage 1.5 (vision model, 1K TPM per model), 5× Stage 2 (~2,000 tokens each), 5× Stage 3 (~1,500 tokens each). Sequential calls spread across ~3-4 minutes, so TPM is rarely the bottleneck unless all pages complete unusually fast.
**How to avoid:** Stage 4 runs last (after all per-page stages), so the per-page TPM usage has already spread over time. Cap Stage 4 input to per-page summaries (not full issue lists) to keep it under 3,000 tokens. On 429: retry once after 60s, then proceed with partial results (skip site-wide narrative, write per-page only).
**Warning signs:** `[Stage 4] 429 rate limit` in Railway logs.

### Pitfall 4: Per-Page Failure Leaves Job in Inconsistent State
**What goes wrong:** Page 3 of 5 throws an exception (e.g., `goto()` timeout, blocked by Cloudflare, PSI API unreachable). If the exception propagates to `processJob`, the entire job fails and no results are written — even though pages 1 and 2 succeeded.
**Why it happens:** Without per-page error isolation, the first page failure propagates through the loop.
**How to avoid:** Wrap each per-page crawl in try/catch. Log the failure and continue with remaining pages. The final DB write includes only successfully analyzed pages. If 0 pages succeed, mark job failed. If 1+ pages succeed, mark job complete with partial results.
**Warning signs:** Jobs with 1-2 pages instead of the expected 5 — check logs for per-page failure messages.

### Pitfall 5: Duplicate Root URL in Discovered Links
**What goes wrong:** `extractInternalLinks` returns the root URL itself (e.g., homepage links to `/` which normalizes to the same URL). Crawling it twice wastes time and produces duplicate results.
**Why it happens:** Many sites have `<a href="/">` in navigation headers. After normalization, this is the same URL as the starting point.
**How to avoid:** Before the loop, exclude `rootUrl` from the `additionalUrls` list: `additionalUrls.filter(u => u !== normalizedRootUrl)`.
**Warning signs:** Two identical `CrawledPage` records with the same URL.

### Pitfall 6: CrawledPageIssue vs Issue Model Drift
**What goes wrong:** The `Issue` model gains new fields in a future phase, but `CrawledPageIssue` is not updated. The two models diverge.
**Why it happens:** Having two parallel issue models creates a maintenance burden.
**How to avoid:** Add a comment to both schema models: `// SYNC: keep in sync with [Issue/CrawledPageIssue] model`. Consider a future refactor to a single `Issue` model with a nullable `crawledPageId`. For Phase 8, accept the duplication.
**Warning signs:** Type errors in crawler after a schema change to Issue but not CrawledPageIssue.

### Pitfall 7: Site-Wide Result.narrative JSON Shape Incompatibility
**What goes wrong:** The site-wide `NarrativeResult` stored in `Result.narrative` includes a new `crossPagePatterns` field that the existing `NarrativeSection` component doesn't know how to render. The component silently ignores it or throws.
**Why it happens:** `NarrativeResult` is a typed interface in `crawler/src/pipeline/types.ts` and `src/types/narrative.ts`. If Phase 8 extends it (e.g. adds `crossPagePatterns`), the cast `result.narrative as unknown as NarrativeResult` on the results page still compiles but the component doesn't render the new field.
**How to avoid:** Either: (a) keep `NarrativeResult` unchanged and store `crossPagePatterns` in a separate `Result.cross_page_patterns Json?` column, or (b) extend `NarrativeResult` and update `NarrativeSection` to conditionally render the new field. Option (a) is cleaner for backward compatibility. [ASSUMED — option (a) recommended; planner decides]
**Warning signs:** Cross-page patterns not appearing in UI despite being in the DB.

### Pitfall 8: `runAIPipeline` Direct DB Write Breaks Multi-page Aggregation
**What goes wrong:** The current `runAIPipeline` writes directly to the DB at the end (`prisma.$transaction`). Calling it N times for N pages creates N `Result` records — but `Job.result` is a `@unique` one-to-one relation. The second call fails with a Prisma unique constraint violation.
**Why it happens:** `Result.jobId` has `@unique` constraint — only one Result per Job.
**How to avoid:** In multi-page mode, `runAIPipeline` must return results instead of writing. The final DB write happens once after all pages are processed, writing one `Result` (site-wide) + N `CrawledPage` records (per-page) in a single atomic transaction.

---

## Code Examples

### Link Extraction Integration in crawlWithViewport

```typescript
// Source: existing browser.ts pattern + Checkly Playwright guide
// crawler/src/browser.ts — desktop pass, after domSignals extraction, before context.close()

// Desktop-only: extract internal links before context closes
let internalLinks: string[] = []
if (options.viewport === 'desktop') {
  internalLinks = await extractInternalLinks(page, url)
  console.log(`[browser] Discovered ${internalLinks.length} internal links from ${url}`)
}

// ... existing screenshot capture ...
// ... existing browserFingerprint evaluation ...

await context.close()  // MUST happen after link extraction
```

The `CrawlPass` type gains an optional `internalLinks?: string[]` field (desktop only):

```typescript
// crawler/src/lib/types.ts — CrawlPass extension
export interface CrawlPass {
  // ... existing fields unchanged ...
  internalLinks?: string[]  // desktop pass only — discovered same-origin links
}
```

### Stage 4 LLM Call Structure

```typescript
// crawler/src/pipeline/site-wide-merger.ts
// Source: existing Stage 3 pattern (stage3-narrator.ts)

import Groq from 'groq-sdk'
import { z } from 'zod/v4'
import type { PageAnalysisResult, SiteWideNarrative, CrossPagePattern } from './types'

const SiteWideNarrativeSchema = z.object({
  narrative: z.object({
    summary: z.string().min(1).max(800),
    perceivedPerformance: z.string().max(600),
    technicalPerformance: z.string().max(600),
    recommendations: z.array(z.string().max(200)).max(5),
  }),
})

export async function runSiteWideAnalysis(
  client: Groq,
  pageResults: PageAnalysisResult[],
  crossPagePatterns: CrossPagePattern[],
): Promise<SiteWideNarrative> {
  // Build compact per-page summaries to stay within TPM limits
  const pageSummaries = pageResults.map((p, i) => ({
    index: i,
    url: p.url,
    pageType: p.pageType,
    topIssues: p.enrichedIssues
      .sort((a, b) => b.severity - a.severity)
      .slice(0, 5)
      .map(issue => `[severity ${issue.severity}] ${issue.signal_source}: ${issue.raw_evidence}`),
  }))

  const systemPrompt = `You are a UX analysis engine. You have analyzed ${pageResults.length} pages from the same website. Synthesize the findings into a unified site-wide analysis.

${crossPagePatterns.length > 0 ? `SITE-WIDE PATTERNS (issues appearing on 3+ pages):
${crossPagePatterns.map(p => `- ${p.signal_source} (${p.page_count} pages, max severity ${p.worst_severity}): ${p.representative_evidence}`).join('\n')}` : 'No site-wide patterns detected — issues are page-specific.'}

Produce a site-wide narrative that:
1. Opens by identifying the most impactful cross-site pattern (if any)
2. Describes the perceived user experience across the site
3. Describes the technical root causes observed across pages
4. Gives 3-5 prioritized recommendations ordered by site-wide impact`

  // ... forced tool call pattern same as Stage 3 ...
}
```

### Results Page Per-page Accordion

```typescript
// src/app/results/[jobId]/page.tsx — new section after NarrativeSection
// Source: existing results page pattern

{result.crawledPages.length > 0 && (
  <div className="mt-8">
    <h2 className="text-base font-semibold text-slate-100 mb-1">Per-page Breakdown</h2>
    <p className="text-sm text-slate-500 mb-4">
      {result.crawledPages.length} page{result.crawledPages.length !== 1 ? 's' : ''} crawled
    </p>
    <div className="space-y-3">
      {result.crawledPages.map((page) => (
        <PageAccordionSection key={page.id} page={page} />
      ))}
    </div>
  </div>
)}
```

`PageAccordionSection` is a new Client Component (needs `"use client"` for open/close toggle state) that renders per-page URL as accordion header, per-page `NarrativeSection`, and per-page `IssueCard[]` list when open.

---

## Runtime State Inventory

> Phase 8 is NOT a rename/refactor phase. Omitting this section.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `playwright-core` | Link extraction + per-page crawl | ✓ | 1.60.0 | — |
| `groq-sdk` | Stage 4 site-wide LLM | ✓ | ^1.2.0 | Skip site-wide narrative; write per-page only |
| `GROQ_API_KEY` | Stage 4 LLM call | ✓ (already used in Stages 2+3) | — | Stage 4 catch → partial result |
| `MAX_CRAWL_PAGES` env var | Page count config | Set default=5 in code | — | Falls back to 5 if not set |
| Prisma migration tooling | New CrawledPage model | ✓ | 7.8.0 | — |
| QStash free tier timeout | Multi-page crawl duration | ✓ | 15 minutes [VERIFIED: upstash.com/pricing/qstash] | Upgrade plan if 5-page crawl exceeds 12 min |
| Groq RPD (llama-3.3-70b) | Stage 2+3+4 | ✓ | 1,000 RPD [VERIFIED: console.groq.com/docs/rate-limits] | At 16 calls/5-page job: 62 multi-page jobs/day cap |
| Fly.io memory | Sequential Chromium crawls | ✓ (1 instance at a time) | Shared-cpu-1x: 256MB–2GB | — |

**Missing dependencies with no fallback:** None — Phase 8 is fully within current infrastructure.

**Memory note:** Sequential crawl (one Playwright browser at a time) keeps peak memory at the existing single-page budget. `browser.close()` in `runDualViewportCrawl`'s `finally` block already ensures cleanup between pages.

---

## Validation Architecture

**nyquist_validation: true** (from `.planning/config.json`)

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (crawler + root) |
| Config file | `crawler/vitest.config.ts` |
| Quick run command | `npm test -- --reporter=dot crawler/src/pipeline/site-wide-merger.test.ts` |
| Full suite command | `npm test` (from repo root — currently 196 tests passing) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CRAWL-01 | `extractInternalLinks` returns only same-origin, non-fragment, non-mailto links | unit | `npm test -- crawler/src/browser.test.ts` | ❌ Wave 0 |
| CRAWL-01 | `extractInternalLinks` deduplicates URLs (returns Set-like result) | unit | `npm test -- crawler/src/browser.test.ts` | ❌ Wave 0 |
| CRAWL-01 | `extractInternalLinks` normalizes relative paths to absolute URLs | unit | `npm test -- crawler/src/browser.test.ts` | ❌ Wave 0 |
| CRAWL-01 | `extractInternalLinks` excludes the root URL itself | unit | `npm test -- crawler/src/browser.test.ts` | ❌ Wave 0 |
| CRAWL-01 | `extractInternalLinks` returns at most `maxPages - 1` URLs | unit | `npm test -- crawler/src/browser.test.ts` | ❌ Wave 0 |
| CRAWL-02 | `detectCrossPagePatterns` returns patterns for signal_sources appearing on >= minPages pages | unit | `npm test -- crawler/src/pipeline/site-wide-merger.test.ts` | ❌ Wave 0 |
| CRAWL-02 | `detectCrossPagePatterns` returns empty array when no signal_source meets threshold | unit | `npm test -- crawler/src/pipeline/site-wide-merger.test.ts` | ❌ Wave 0 |
| CRAWL-02 | `detectCrossPagePatterns` sorts results by worst_severity descending | unit | `npm test -- crawler/src/pipeline/site-wide-merger.test.ts` | ❌ Wave 0 |
| CRAWL-02 | `runSiteWideAnalysis` returns `SiteWideNarrative` with summary, perceivedPerformance, technicalPerformance, recommendations | unit (mock Groq) | `npm test -- crawler/src/pipeline/site-wide-merger.test.ts` | ❌ Wave 0 |
| CRAWL-03 | Results page renders per-page accordion when `crawledPages.length > 0` | unit | `npm test -- src/app/results` | ❌ Wave 0 |
| CRAWL-03 | Results page renders single-URL layout (no accordion) when `crawledPages.length === 0` | unit | `npm test -- src/app/results` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** Quick run on the specific test file being modified
- **Per wave merge:** `npm test` (full suite — currently 196 tests)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `crawler/src/browser.test.ts` — `extractInternalLinks` unit tests (mock `page.evaluate`)
- [ ] `crawler/src/pipeline/site-wide-merger.test.ts` — `detectCrossPagePatterns` + `runSiteWideAnalysis` tests
- [ ] `crawler/src/pipeline/types.ts` — add `PageAnalysisResult`, `SiteWideNarrative`, `CrossPagePattern` types
- [ ] Prisma migration — `CrawledPage`, `CrawledPageIssue`, `CrawledPageEdge` models
- [ ] Sync `crawler/prisma/schema.prisma` with root `prisma/schema.prisma` after migration

---

## Security Domain

`security_enforcement` is absent from `.planning/config.json` — treating as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No new auth paths |
| V3 Session Management | No | Stateless pipeline |
| V4 Access Control | No | No new endpoints; existing QStash signature verification unchanged |
| V5 Input Validation | Yes | (a) discovered URLs validated via `new URL()` constructor before crawling; (b) SSRF guard already present in `browser.ts` (`isPrivateHost`) — applies to discovered pages too; (c) `MAX_PAGES` env var parsed with `parseInt` and capped at 10 (hard safety cap regardless of env value) |
| V6 Cryptography | No | No new crypto operations |

### Known Threat Patterns for Multi-page Crawl

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SSRF via discovered internal link pointing to private IP | Tampering | Existing `isPrivateHost` check in `context.route()` handler in `browser.ts` — applies automatically to all pages crawled with the same browser context |
| Crawler trap (infinite pages via query params / session IDs) | DoS | `MAX_PAGES` hard cap (default 5, env configurable, absolute max 10); URL normalization strips query params that create duplicate effective pages |
| Malicious page with 10,000 `<a>` tags inflating link set | DoS | `extractInternalLinks` returns links; caller slices to `MAX_PAGES - 1` regardless of list size — bounded by design |
| LLM prompt injection via discovered page content in Stage 4 | Tampering | Stage 4 input is per-page issue summaries (structured data from our own pipeline), not raw page content — limited injection surface |
| Cross-page issue result leakage (user A's results visible in user B's site-wide analysis) | Information Disclosure | Not applicable — FeelTrace has no multi-tenant auth; all analyses are public by design (shareable link model); Phase 8 does not change this |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single-URL crawl only | Multi-page crawl with link discovery | Phase 8 (this phase) | Enables site-wide analysis across up to 5 pages |
| One Result per job | One Result (site-wide) + N CrawledPage records per job | Phase 8 (this phase) | Per-page breakdown stored relationally; backward compatible |
| Static 55s SLA timeout | Per-page 90s timeout + 8-minute total timeout | Phase 8 (this phase) | Accommodates multi-page duration while bounding worst case |
| NarrativeResult from single page | Site-wide NarrativeResult from Stage 4 merge | Phase 8 (this phase) | Cross-page pattern synthesis |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | robots.txt compliance is not required because FeelTrace users analyze their own sites | Link Discovery | If FeelTrace later allows third-party analysis, robots.txt compliance becomes a legal/ethical requirement |
| A2 | Prioritizing shorter URL paths gives better coverage of key user-facing pages | Link Discovery crawl ordering | If wrong, some important pages are missed; no correctness impact — only coverage quality |
| A3 | `mode: 'single' \| 'multi'` param on `runAIPipeline` is the right refactor approach | Pattern 3 | If planner prefers clean separation, a full split into `runPipelineStages` + `writePipelineResult` is an equally valid alternative |
| A4 | Per-page 90s timeout and 8-minute total timeout are sufficient for 5-page crawls | Performance | If PSI API is consistently slow (p95 = 40s) AND Groq has retry delays, the 8-minute budget may be tight; the 15-minute QStash free tier limit gives margin |
| A5 | Cross-page patterns use signal_source grouping with threshold ≥ 3 pages | Cross-page pattern detection | If threshold is too high (many sites have <5 pages), few patterns will be detected; threshold should be configurable via env var |
| A6 | `CrawledPage`, `CrawledPageIssue`, `CrawledPageEdge` are separate Prisma models (not reusing `Issue`) | Schema | If planner prefers a single `Issue` model with a `crawledPageId` discriminator, the migration is different |
| A7 | Cross-page patterns stored in `Result.narrative` JSON (not a separate column) | Pitfall 7 | If a separate `cross_page_patterns Json?` column is preferred, migration adds one column; no structural impact |
| A8 | Sequential crawl is the right execution model (not parallel) | Performance | If Fly.io memory is upgraded to 2+ GB, parallel crawl would reduce total wall-clock time significantly |
| A9 | 62 multi-page analyses per day (at 5 pages each) is adequate for MVP | Groq rate limits | If user volume exceeds 62 multi-page analyses/day, paid Groq tier is required |
| A10 | `MAX_CRAWL_PAGES` env var with default 5 is the right configuration surface | CRAWL-01 | No risk — configurable via env; only affects how many pages are discovered and crawled |

---

## Open Questions

1. **Should single-URL mode stay exactly as it is, or should it run through the multi-page code path with MAX_PAGES=1?**
   - What we know: The existing `processJob` directly calls `runDualViewportCrawl` + `runAIPipeline` (single-URL path). The regression requirement says "single-URL mode produces identical output to v1.0."
   - What's unclear: Whether "identical output" means the same code path or the same results. If we run single-URL through the multi-page code path (MAX_PAGES=1), results are identical but the code is simpler (one path).
   - Recommendation: Run all submissions through the multi-page code path with `MAX_PAGES` defaulting to 5. A submission that discovers 0 additional pages is functionally identical to single-URL mode. The `result.crawledPages.length === 0` guard in the UI hides the accordion. This avoids maintaining two code paths.

2. **Where should cross-page patterns be persisted in the DB?**
   - What we know: `Result.narrative` is a `Json` column already storing `NarrativeResult`. Cross-page patterns could extend that JSON, or be stored in a new `Result.cross_page_patterns Json?` column.
   - What's unclear: Whether future phases will need to query patterns directly (e.g., filter jobs by pattern type). If yes, a separate column with proper typing is better.
   - Recommendation: Add `cross_page_patterns Json?` as a new nullable column on `Result`. Keeps the `NarrativeResult` shape clean and avoids breaking `NarrativeSection` component rendering.

3. **Should `PageAccordionSection` be open or closed by default?**
   - What we know: For 5 pages, all-open would show a lot of content. All-closed requires user interaction to see per-page issues.
   - What's unclear: The most useful default from a UX perspective.
   - Recommendation: The root page (page_index=0) is open by default; additional pages are closed. The root page's issues are most relevant to the user's starting URL.

---

## Sources

### Primary (HIGH confidence)
- `crawler/src/processor.ts` — existing job lifecycle, 55s SLA, QStash delivery model
- `crawler/src/browser.ts` — `runDualViewportCrawl`, `crawlWithViewport`, screenshot capture, link extraction point
- `crawler/src/pipeline/run-pipeline.ts` — `runAIPipeline` direct DB write pattern
- `crawler/src/pipeline/types.ts` — `ScoredIssue`, `EnrichedIssue`, `CausalEdgeCandidate`, `NarrativeResult`
- `crawler/src/lib/types.ts` — `CrawlPass`, `TechProfile`, `ExternalSignals`, `DOMSignals`
- `prisma/schema.prisma` and `crawler/prisma/schema.prisma` — current DB schema
- `src/app/results/[jobId]/page.tsx` — existing results page Prisma query + rendering
- `src/components/IssueCard.tsx` — issue card props shape
- [upstash.com/pricing/qstash](https://upstash.com/pricing/qstash) — Free tier: 15-minute HTTP response timeout; Pay-as-you-go: 2 hours
- [console.groq.com/docs/rate-limits](https://console.groq.com/docs/rate-limits) — llama-3.3-70b and llama-4-scout: 1,000 RPD, 12,000 TPM (free tier)

### Secondary (MEDIUM confidence)
- [playwright.dev/docs/evaluating](https://playwright.dev/docs/evaluating) — `page.evaluate()` for DOM extraction
- [checkly docs — detect broken links](https://www.checklyhq.com/docs/learn/playwright/how-to-detect-broken-links/) — `locator.all()` + `new URL()` constructor for same-origin filtering
- [fly.io/docs/machines/guides-examples/machine-sizing/](https://fly.io/docs/machines/guides-examples/machine-sizing/) — shared-cpu-1x: 256MB–2GB RAM range
- Phase 7 RESEARCH.md and SUMMARY files (01–04) — confirmed Stage 1–3 pipeline architecture, Groq client usage, `run-pipeline.ts` DB write pattern

### Tertiary (LOW confidence)
- Multi-page crawl best practices (community sources) — deduplication, URL normalization, sequential vs parallel tradeoffs
- Groq community blog posts corroborating 1,000 RPD figures

---

## Metadata

**Confidence breakdown:**
- Link discovery architecture: HIGH — `page.evaluate()` + URL constructor is the documented Playwright pattern; SSRF guard already implemented
- Multi-page loop orchestration: HIGH — direct extension of existing `processJob` pattern
- Schema design (`CrawledPage` model): HIGH — clean relational model following existing conventions
- Stage 4 site-wide LLM call: MEDIUM — novel pattern for this project; same tool-call discipline as Stages 2+3 but cross-page aggregation prompt is untested
- Cross-page pattern detection (deterministic): HIGH — pure grouping logic over structured data
- UI accordion: MEDIUM — pattern is straightforward React; specific open/close behavior is a UX judgment call
- Groq rate limit math: HIGH — RPD limits confirmed from official docs
- QStash timeout: HIGH — 15-minute free tier confirmed from pricing page

**Research date:** 2026-05-28
**Valid until:** 2026-06-28 (30 days; QStash pricing and Groq rate limits may change; architecture is stable)
