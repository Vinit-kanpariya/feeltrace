# Phase 3: AI Pipeline — Pattern Map

**Mapped:** 2026-05-26
**Files analyzed:** 10 (8 new, 2 modified)
**Analogs found:** 10 / 10

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `crawler/src/pipeline/types.ts` | type definitions | — | `crawler/src/lib/types.ts` | exact |
| `crawler/src/pipeline/stage1-scorer.ts` | utility / transform | batch, transform | `crawler/src/extractors/js.ts` (`classifyScripts`) | role-match |
| `crawler/src/pipeline/stage2-reasoner.ts` | service | request-response (outbound LLM) | `crawler/src/extractors/network.ts` (async I/O service) | partial-match |
| `crawler/src/pipeline/stage3-narrator.ts` | service | request-response (outbound LLM) | `crawler/src/extractors/network.ts` | partial-match |
| `crawler/src/pipeline/run-pipeline.ts` | orchestrator / service | batch, CRUD write | `crawler/src/processor.ts` | role-match |
| `crawler/src/lib/anthropic.ts` | utility / singleton | — | `crawler/src/lib/prisma.ts` | exact |
| `crawler/src/pipeline/stage1-scorer.test.ts` | test | — | `crawler/src/extractors/js.test.ts` | exact |
| `crawler/src/pipeline/stage2-reasoner.test.ts` | test | — | `crawler/src/extractors/network.test.ts` | exact |
| `crawler/src/pipeline/stage3-narrator.test.ts` | test | — | `crawler/src/extractors/dom.test.ts` | exact |
| `crawler/src/processor.ts` (modify) | orchestrator | request-response | itself | exact |
| `crawler/package.json` (modify) | config | — | itself | exact |

---

## Pattern Assignments

### `crawler/src/pipeline/types.ts` (type definitions)

**Analog:** `crawler/src/lib/types.ts`

**Pattern — interface declaration style** (lines 1–8, 101–108):
```typescript
// crawler/src/lib/types.ts lines 1-8
// Canonical signal type contracts for all four extractors and the Phase 3 AI pipeline.
// Source: .planning/phases/02-crawler-service/02-CONTEXT.md "Signal Type Contracts"
// All interfaces must be imported from this file — do not redeclare in extractor files.

export interface DOMSignals {
  maxDOMDepth: number
  // ...
}
```

**Pattern — union literal types on interface fields** (lines 101–108):
```typescript
// crawler/src/lib/types.ts lines 101-108
export interface CrawlPass {
  viewport: 'mobile' | 'desktop'
  domSignals: DOMSignals
  cssSignals: CSSSignals
  jsSignals: JSSignals
  networkSignals: NetworkSignals
}
```

**Instructions for `pipeline/types.ts`:**
- Follow the same `export interface` style with no classes, no default exports
- Add a top-of-file comment anchoring types to the plan that defines them
- Severity as a numeric union: `severity: 1 | 2 | 3 | 4`
- Category as a string union: `category: 'perceived-perf' | 'technical-perf' | 'accessibility'`
- Export a `SEVERITY_LABELS` const mapping `{ 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' }` for Phase 4 display layer use

---

### `crawler/src/pipeline/stage1-scorer.ts` (utility, transform)

**Analog:** `crawler/src/extractors/js.ts`

**Imports pattern** (lines 1–2 of js.ts):
```typescript
// crawler/src/extractors/js.ts lines 1-2
import { Page } from 'playwright-core'
import { JSSignals } from '../lib/types'
```
For scorer, replace with:
```typescript
import { CrawlPass } from '../lib/types'
import type { ScoredIssue } from './types'
```

**Pattern — exported pure helper function + main exported function** (lines 25–65):
```typescript
// crawler/src/extractors/js.ts lines 25-65
export function classifyScripts(
  scripts: ScriptDescriptor[],
  pageOrigin: string
): ScriptClassification {
  let scriptCount = 0
  // ... imperative threshold logic ...
  for (const s of scripts) {
    if (!s.src) continue
    scriptCount++
    if (s.async) asyncScriptCount++
    // ...
    if (!s.async && !s.defer && s.type !== 'module' && s.inHead) {
      renderBlockingCount++
    }
    // ...
  }
  return { scriptCount, renderBlockingCount, /* ... */ }
}
```
Stage 1 scorer follows the same pattern: a single exported `scoreSignals(mobile: CrawlPass, desktop: CrawlPass): ScoredIssue[]` function containing imperative threshold comparisons that push to an output array.

**Pattern — explicit zero-initialisation before loop, return aggregate** (lines 29–65):
```typescript
// crawler/src/extractors/js.ts lines 29-65
let scriptCount = 0
let renderBlockingCount = 0
// ...
for (const s of scripts) { /* accumulate */ }
return { scriptCount, renderBlockingCount, ... }
```
For scorer: `const issues: ScoredIssue[] = []` before threshold checks, `return issues` at end.

**Deduplication note:** The scorer must implement the deduplication rule (worst viewport wins, one issue per threshold level) as a helper function that can be independently unit-tested — the same pattern as `getMaxDepth` in `dom.ts` (an exported helper alongside the main extractor).

---

### `crawler/src/pipeline/stage2-reasoner.ts` (service, outbound LLM)

**Analog (for file structure):** `crawler/src/extractors/network.ts`

**Imports pattern** (lines 1–2 of network.ts):
```typescript
// crawler/src/extractors/network.ts lines 1-2
import fs from 'fs/promises'
import { NetworkSignals, HAREntry } from '../lib/types'
```
For reasoner, replace with:
```typescript
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod/v4'
import type { ScoredIssue, EnrichedIssue, CausalEdgeCandidate } from './types'
```

**Pattern — module-level constants before exported function** (lines 4–11 of network.ts):
```typescript
// crawler/src/extractors/network.ts lines 4-11
const CDN_FINGERPRINTS = [
  'cloudfront.net',
  'fastly.net',
  // ...
]
```
For reasoner: `CAUSALITY_MECHANISM_RULES` string constant and `SYSTEM_PROMPT` string constant declared at module level, before the exported function. Keep 100% static (no runtime interpolation) to enable prompt cache hits.

**Pattern — async function returning typed object** (lines 38–131 of network.ts):
```typescript
// crawler/src/extractors/network.ts lines 38-41
export async function extractNetworkSignals(harPath: string): Promise<NetworkSignals> {
  const raw = await fs.readFile(harPath, 'utf-8')
  // ...
}
```
For reasoner: `export async function runStage2Reasoning(client: Anthropic, scoredIssues: ScoredIssue[]): Promise<{ enrichedIssues: EnrichedIssue[]; edges: CausalEdgeCandidate[] }>`

**Zod import pattern** (from `crawler/src/server.ts` line 12 — confirmed import path):
```typescript
// crawler/src/server.ts line 12
import { z } from 'zod/v4'
```
Use `zod/v4` import path throughout (not `'zod'`).

**Zod schema pattern** (from `crawler/src/server.ts` lines 25–28):
```typescript
// crawler/src/server.ts lines 25-28
const PayloadSchema = z.object({
  jobId: z.string().min(1),
  url: z.string().url(),
})
```
For Stage 2 output validation: use `z.object({ enriched_issues: z.array(...), causal_edges: z.array(...).max(5) })` — same pattern, no class or factory, just a module-level `const` schema.

---

### `crawler/src/pipeline/stage3-narrator.ts` (service, outbound LLM)

**Analog:** `crawler/src/extractors/network.ts` (same structural pattern as stage2-reasoner)

**Imports pattern:**
```typescript
import Anthropic from '@anthropic-ai/sdk'
import type { EnrichedIssue, CausalEdgeCandidate, NarrativeResult } from './types'
```

**Pattern — module-level static prompt constant + exported async function:**
Same as stage2-reasoner. `NARRATOR_SYSTEM_PROMPT` is a module-level `const string`. No dynamic content in the system prompt — all runtime data goes in the `messages[0].content` user turn.

**Pattern — text extraction from response:**
```typescript
// RESEARCH.md Pattern 3 (plain text response, no tool use):
const text = response.content.find(b => b.type === 'text')?.text ?? ''
return parseNarrativeOutput(text)
```
`parseNarrativeOutput` is an exported pure function (co-located in the same file or extracted for testability) that splits on `[SUMMARY]`, `[PERCEIVED PERFORMANCE]`, `[TECHNICAL PERFORMANCE]`, `[RECOMMENDATIONS]` markers and returns `NarrativeResult`.

---

### `crawler/src/pipeline/run-pipeline.ts` (orchestrator, CRUD write)

**Analog:** `crawler/src/processor.ts`

**Imports pattern** (lines 1–2 of processor.ts):
```typescript
// crawler/src/processor.ts lines 1-2
import { prisma } from './lib/prisma'
import { runDualViewportCrawl } from './browser'
```
For run-pipeline:
```typescript
import { prisma } from '../lib/prisma'
import { getAnthropicClient } from '../lib/anthropic'
import { scoreSignals } from './stage1-scorer'
import { runStage2Reasoning } from './stage2-reasoner'
import { runStage3Narration } from './stage3-narrator'
import type { CrawlPass } from '../lib/types'
```

**Pattern — async function with try/catch, status transitions, console.log** (lines 6–50 of processor.ts):
```typescript
// crawler/src/processor.ts lines 6-50
export async function processJob(jobId: string, url: string): Promise<void> {
  // guard: idempotency check
  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { status: true } })
  if (!job) {
    console.warn(`[processor] Job ${jobId} not found — discarding`)
    return
  }
  // ...
  try {
    await prisma.job.update({ where: { id: jobId }, data: { status: 'crawling' } })
    // ... work ...
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown crawler error'
    console.error(`[processor] Job ${jobId} failed:`, message)
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'failed', error_message: message.slice(0, 500) },
    })
  }
}
```
`run-pipeline.ts` exports `runAIPipeline(jobId: string, signals: { mobile: CrawlPass; desktop: CrawlPass }): Promise<void>` — no try/catch needed here (processor.ts's outer catch handles job failure), but follow same `console.log` prefix pattern `[pipeline]`.

**Prisma write pattern — nested create with include** (RESEARCH.md Pattern 6):
```typescript
// RESEARCH.md Pattern 6 (lines 551-583)
await prisma.$transaction(async (tx) => {
  const result = await tx.result.create({
    data: {
      jobId,
      narrative,
      issues: {
        create: enrichedIssues.map((issue) => ({
          category: issue.category,
          signal_source: issue.signal_source,
          severity: issue.severity,
          raw_evidence: issue.raw_evidence,
          technical_description: issue.technical_description,
        })),
      },
    },
    include: { issues: true },
  })
  if (edges.length > 0) {
    await tx.causalEdge.createMany({
      data: edges.map((edge) => ({
        resultId: result.id,
        fromIssueId: result.issues[edge.fromIndex].id,
        toIssueId: result.issues[edge.toIndex].id,
        relationship: edge.relationship,
        confidence: edge.confidence,
        mechanism: edge.mechanism, // non-nullable — zod ensures this is populated
        explanation: edge.explanation ?? '',
      })),
    })
  }
})
```
Key schema constraints from `crawler/prisma/schema.prisma` lines 63–75:
- `CausalEdge.mechanism String` — non-nullable, Prisma rejects create without it
- `CausalEdge.explanation String` — non-nullable, use `?? ''` fallback
- `Result.narrative Json` — store as `NarrativeResult` object

---

### `crawler/src/lib/anthropic.ts` (utility, singleton)

**Analog:** `crawler/src/lib/prisma.ts`

**Singleton pattern** (lines 15–27 of prisma.ts):
```typescript
// crawler/src/lib/prisma.ts lines 15-27
const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```
For Anthropic singleton, use the same lazy-init pattern but simpler (no adapter):
```typescript
// RESEARCH.md Pattern 5
import Anthropic from '@anthropic-ai/sdk'
let _client: Anthropic | null = null
export function getAnthropicClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}
```
Note: prisma.ts uses a module-level `const` with `global` guard; anthropic.ts uses a module-level `let` with null guard — both achieve lazy init. Use the `let _client` pattern for Anthropic since it does not need dev hot-reload preservation.

---

### `crawler/src/pipeline/stage1-scorer.test.ts` (test — unit, no I/O)

**Analog:** `crawler/src/extractors/js.test.ts`

**Test file header** (lines 1–5 of js.test.ts):
```typescript
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { classifyScripts } from './js'
```
For scorer test — no DOM needed, use `node` environment:
```typescript
// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { scoreSignals } from './stage1-scorer'
```

**Pattern — fixture builder function** (lines 7–18 of js.test.ts):
```typescript
// crawler/src/extractors/js.test.ts lines 7-18
function makeScript(overrides: Partial<{
  async: boolean; defer: boolean; type: string; src: string; inHead: boolean
}> = {}) {
  return {
    async: false,
    defer: false,
    // ...
    ...overrides,
  }
}
```
For scorer test: create `makeCrawlPass(overrides?: Partial<CrawlPass>): CrawlPass` helper that returns a safe default pass (all signals below all thresholds), then override specific fields per test case.

**Pattern — describe per logical unit, it() per threshold boundary** (lines 20–91):
```typescript
// crawler/src/extractors/js.test.ts lines 20-91
describe('classifyScripts', () => {
  it('returns all-zero counts for empty array', () => { ... })
  it('counts async script and does not mark as render-blocking', () => { ... })
  it('marks head-only non-async/defer/module script as render-blocking', () => { ... })
  // ...
})
```
For scorer: one `describe` per signal type group (network, js, css, dom), one `it()` per threshold boundary (at threshold, just below, just above).

**Required test cases per RESEARCH.md Validation Architecture:**
- AI-01: correct severity for known signal values (e.g., TTFB = 2400 → Critical)
- AI-01: deduplication — mobile + desktop same issue emits one record, not two
- AI-04: TTFB issue has `category: 'perceived-perf'`
- AI-04: `jsSignals.totalJSBytes` issue has `category: 'technical-perf'`

---

### `crawler/src/pipeline/stage2-reasoner.test.ts` (test — unit, mock LLM)

**Analog:** `crawler/src/server.test.ts` (mock-heavy test file)

**Mock pattern** (lines 6–36 of server.test.ts):
```typescript
// crawler/src/server.test.ts lines 6-36
const mockVerify = vi.fn()

vi.mock('@upstash/qstash', () => {
  class MockReceiver {
    verify: typeof mockVerify
    constructor() { this.verify = mockVerify }
  }
  return { Receiver: MockReceiver }
})
```
For stage2 test: mock `@anthropic-ai/sdk` to return a fixture tool-use response without making live API calls:
```typescript
// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { z } from 'zod/v4'
// Test the zod schema and parseStage2Output directly — no Anthropic mock needed for pure validation tests
import { Stage2OutputSchema } from './stage2-reasoner'
```
For validation-only tests (the primary Wave 0 scope), import and exercise the exported zod schema and parse function directly without mocking the SDK at all.

**Pattern — beforeEach reset** (lines 64–66 of server.test.ts):
```typescript
// crawler/src/server.test.ts lines 64-66
beforeEach(() => {
  getMockVerify().mockReset()
})
```

**Required test cases per RESEARCH.md Validation Architecture:**
- AI-02: zod schema rejects out-of-list mechanism string
- AI-02: zod schema rejects `causal_edges` array longer than 5
- AI-02: self-edge filter removes `from_index === to_index` edges
- AI-02: out-of-range `index` values are discarded

---

### `crawler/src/pipeline/stage3-narrator.test.ts` (test — unit, pure function)

**Analog:** `crawler/src/extractors/dom.test.ts`

**Test file header** (lines 1–4 of dom.test.ts):
```typescript
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { getMaxDepth, computeSemanticScore } from './dom'
```
For narrator test — pure string parsing, use `node` environment:
```typescript
// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { parseNarrativeOutput } from './stage3-narrator'
```

**Pattern — fixture string inline in test body** (lines 33–60 of dom.test.ts):
```typescript
// crawler/src/extractors/dom.test.ts lines 35-38
it('counts h1 elements correctly', () => {
  document.body.innerHTML = '<h1>A</h1><h1>B</h1><h1>C</h1>'
  const score = computeSemanticScore(document)
  expect(score.h1Count).toBe(3)
})
```
For narrator test: define fixture narrative strings inline:
```typescript
const FIXTURE_NARRATIVE = `
[SUMMARY]
The site has significant performance issues.

[PERCEIVED PERFORMANCE]
Users experience the page as slow and unresponsive.

[TECHNICAL PERFORMANCE]
TTFB is 2400ms. Render-blocking JS count is 4.

[RECOMMENDATIONS]
- Enable CDN caching
- Defer non-critical JS
`
```

**Required test cases per RESEARCH.md Validation Architecture:**
- AI-03: parser splits narrative into 4 sections correctly
- AI-03: missing section returns empty string (not crash)
- AI-04: `perceivedPerformance` field extracted from `[PERCEIVED PERFORMANCE]` section
- AI-04: `technicalPerformance` field extracted from `[TECHNICAL PERFORMANCE]` section
- AI-04: `recommendations` parsed as `string[]` (bullet points stripped of leading `- `)

---

### `crawler/src/processor.ts` (modification)

**File:** `crawler/src/processor.ts` (read — lines 1–50)

**Exact stub to replace** (lines 37–40):
```typescript
// crawler/src/processor.ts lines 37-40 — CURRENT STATE
    await prisma.job.update({ where: { id: jobId }, data: { status: 'analyzing' } })

    // TODO Phase 3: invoke AI pipeline with _signals, write Result/Issue/CausalEdge records
    await prisma.job.update({ where: { id: jobId }, data: { status: 'complete' } })
```

**Replacement pattern** (keep surrounding try/catch from lines 20–49 intact):
```typescript
    await prisma.job.update({ where: { id: jobId }, data: { status: 'analyzing' } })

    // Phase 3: AI pipeline — scoreSignals → LLM reasoning → LLM narration → DB write
    await runAIPipeline(jobId, _signals)

    await prisma.job.update({ where: { id: jobId }, data: { status: 'complete' } })
    console.log(`[processor] Job ${jobId} completed in ${Date.now() - startedAt}ms`)
```

Add import at top of file (after existing imports on lines 1–2):
```typescript
import { runAIPipeline } from './pipeline/run-pipeline'
```

---

### `crawler/package.json` (modification)

**File:** `crawler/package.json` (read — lines 1–30)

**Current dependencies block** (lines 14–28):
```json
  "dependencies": {
    "@hono/node-server": "^2.0.3",
    "@neondatabase/serverless": "^1.1.0",
    "@prisma/adapter-neon": "^7.8.0",
    "@prisma/client": "7.8.0",
    "@upstash/qstash": "2.11.0",
    "hono": "4.12.21",
    "p-queue": "9.3.0",
    "playwright-core": "1.60.0",
    "zod": "4.4.3"
  },
```

**Addition:** `"@anthropic-ai/sdk": "0.98.0"` inserted into `"dependencies"` block, alphabetical position between `@hono/node-server` and `@neondatabase/serverless`.

**Install command** (CLAUDE.md requirement — sfw prefix mandatory):
```bash
sfw npm install @anthropic-ai/sdk
```

---

## Shared Patterns

### Singleton / Module-Level Client Init
**Source:** `crawler/src/lib/prisma.ts` lines 15–27
**Apply to:** `crawler/src/lib/anthropic.ts`
- Lazy init via module-level `let` (null guard) or `global` guard
- Read env var inside the factory function, not at module load
- Export a getter function (not the client directly) to allow for test injection

### Zod Import Path
**Source:** `crawler/src/server.ts` line 12
**Apply to:** `crawler/src/pipeline/stage2-reasoner.ts`, any file using zod
```typescript
import { z } from 'zod/v4'
```
This is the confirmed import path for zod 4.4.3 in this project (not `'zod'`).

### TypeScript Import Style (type-only imports)
**Source:** `crawler/src/extractors/dom.ts` line 2, `crawler/src/extractors/network.ts` line 2
```typescript
import { DOMSignals } from '../lib/types'
import { NetworkSignals, HAREntry } from '../lib/types'
```
For pipeline files: use `import type { ... }` for type-only imports from `./types` to avoid circular issues.

### console.log Prefix Convention
**Source:** `crawler/src/processor.ts` lines 35, 41, 43
```typescript
console.warn(`[processor] Job ${jobId} not found — discarding`)
console.log(`[processor] Job ${jobId} completed in ${Date.now() - startedAt}ms`)
console.error(`[processor] Job ${jobId} failed:`, message)
```
Use `[pipeline]` prefix for all logging in `run-pipeline.ts`, `[scorer]` in stage1 (if logging), etc.

### Error Message Truncation on DB Write
**Source:** `crawler/src/processor.ts` line 47
```typescript
data: { status: 'failed', error_message: message.slice(0, 500) },
```
Apply same `.slice(0, 500)` truncation to any string written to a DB column with implicit length limits.

### Test Environment Directive
**Source:** `crawler/src/extractors/dom.test.ts` line 1, `crawler/src/extractors/network.test.ts` line 1
```typescript
// @vitest-environment jsdom   (for DOM tests)
// @vitest-environment node    (for Node/async I/O tests)
```
All pipeline test files use `// @vitest-environment node` — no DOM is required.

### Vitest Import Set (no mock needed)
**Source:** `crawler/src/extractors/js.test.ts` line 2
```typescript
import { describe, it, expect } from 'vitest'
```
Stage 1 and Stage 3 tests (pure functions, no mocks): use this minimal import.

### Vitest Import Set (with mocks)
**Source:** `crawler/src/extractors/network.test.ts` lines 2–3, `crawler/src/server.test.ts` lines 6–8
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
```
Stage 2 test (if mocking Anthropic SDK): add `vi` and `beforeEach`.

---

## No Analog Found

All files have close analogs in the codebase. No files require falling back to RESEARCH.md patterns exclusively.

| File | Role | Closest Match | Notes |
|---|---|---|---|
| `crawler/src/lib/anthropic.ts` | singleton | `crawler/src/lib/prisma.ts` | Exact pattern match; SDK singleton simpler than PrismaClient (no adapter needed) |

---

## Critical Schema Constraints (from `crawler/prisma/schema.prisma` lines 63–75)

These must be respected in all `prisma.create` calls inside `run-pipeline.ts`:

| Field | Type | Nullable | Constraint |
|---|---|---|---|
| `CausalEdge.mechanism` | `String` | **NO** | Zod enum validates before create; omission throws at runtime |
| `CausalEdge.explanation` | `String` | **NO** | Use `explanation: edge.explanation ?? ''` fallback |
| `CausalEdge.relationship` | `String` | **NO** | Required |
| `CausalEdge.confidence` | `String` | **NO** | Required |
| `Result.narrative` | `Json` | **NO** | Store as `NarrativeResult` object, not a string |
| `Issue.severity` | `Int` | **NO** | Map: Critical=4, High=3, Medium=2, Low=1 |
| `Issue.technical_description` | `String` | **NO** | Must be non-empty; zod validates min(1) |

---

## Metadata

**Analog search scope:** `crawler/src/` (all subdirectories)
**Files scanned:** 11 source files + 1 schema + 1 package.json
**Pattern extraction date:** 2026-05-26
