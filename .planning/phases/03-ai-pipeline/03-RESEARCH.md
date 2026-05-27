# Phase 3: AI Pipeline — Research

**Researched:** 2026-05-26
**Domain:** Three-stage signal-to-insight pipeline: deterministic scoring, Gemini LLM reasoning + causality edge generation, LLM narration
**Confidence:** HIGH (Google Gemini SDK patterns verified via official docs; Prisma schema read from source; signal types read from canonical types.ts; processor stub confirmed in source)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AI-01 | Rule-based scoring stage classifies each extracted signal into Critical / High / Medium / Low severity using deterministic thresholds (no LLM at this stage) | Scoring thresholds table + Stage 1 pattern |
| AI-02 | LLM reasoning stage (Gemini) explains why each scored issue matters and generates causality edges between issues — grounded only in signals that passed scoring; LLM is not permitted to invent issues | Stage 2 forced function-calling pattern + mechanism rule set |
| AI-03 | LLM narration stage (Gemini) generates a 2–4 paragraph plain-English summary readable by non-engineers (PMs, UX leads, agency clients) | Stage 3 narration prompt pattern |
| AI-04 | AI pipeline explicitly distinguishes perceived performance (how slow it feels) from technical performance (what the metrics say) in both the issue list and narrative | Perceived vs technical framing section + prompt excerpt |
</phase_requirements>

---

## Summary

Phase 3 implements the three-stage AI pipeline that converts in-memory signal objects (produced by Phase 2's crawler) into the persisted `Result`, `Issue`, and `CausalEdge` records that the Phase 4 dashboard displays. The pipeline runs inside the existing crawler service (`processor.ts`) — signals are in-memory at that point, so the pipeline must live in the same process. No new deployment target is required.

Stage 1 is purely deterministic: a set of threshold rules converts each `CrawlPass` (mobile + desktop) into a flat list of `ScoredIssue` objects with severity labels. No LLM is involved at this stage; AI-01 requires that severity is not inferred by the model. Stage 2 calls `gemini-2.0-flash` with the scored issue list (not raw signals) and forces a structured function call that produces per-issue explanations and causality edges. Every edge is required to carry a non-null `mechanism` field derived from the 10-15 rule definitions the planner must encode — the LLM cannot invent edges that are not grounded in the scored issue list. Stage 3 calls `gemini-2.0-flash` a second time with the enriched issue list and edges to generate a 2–4 paragraph plain-English narrative, with an explicit perceived-vs-technical section required by AI-04.

The Google Generative AI TypeScript SDK (`@google/generative-ai`) is the correct package. It requires `GEMINI_API_KEY` as an environment variable. Forced function calling (`functionCallingConfig: { mode: FunctionCallingMode.ANY }`) is the right pattern for Stage 2 to guarantee structured JSON output without free-form invention. No prompt caching is available on the free tier (Google AI Studio).

**Primary recommendation:** Implement the pipeline as `crawler/src/pipeline/` with three files: `stage1-scorer.ts` (pure functions, fully unit-testable), `stage2-reasoner.ts` (LLM call, tool use), `stage3-narrator.ts` (LLM call, text output). Wire them in `processor.ts` by replacing the `TODO Phase 3` stub.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Stage 1: deterministic signal scoring | Crawler service (processor.ts) | — | Signals are in-memory inside the crawler process; no transit needed |
| Stage 2: LLM reasoning + causality edges | Crawler service (outbound HTTP to Gemini) | — | Same process owns the scored issues; one Gemini API call per job |
| Stage 3: LLM narration | Crawler service (outbound HTTP to Gemini) | — | Consecutive call in same job lifecycle; no additional routing needed |
| Write Result/Issue/CausalEdge to DB | Crawler service → Neon (PrismaNeon adapter) | — | Crawler already has Prisma client; Neon pooler URL already configured |
| GEMINI_API_KEY secret | Fly.io env vars | — | Same pattern as DATABASE_URL — set in Fly.io secrets, never in code |
| Job status progression (analyzing → complete) | Crawler service (processor.ts) | — | Existing status transition framework; pipeline replaces the TODO stub |
| Rate limiting on Gemini API spend | Crawler service (per-job token budget) | INFRA-02 (Upstash Redis, upstream) | INFRA-02 already rate-limits submissions per IP; free tier has per-minute request caps |

---

## Standard Stack

### Core (new packages needed in `crawler/`)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @google/generative-ai | latest | Google Gemini API client — Stage 2 and Stage 3 LLM calls | Official Google AI SDK |

### Already Present (no new install needed)

| Library | Version | Purpose |
|---------|---------|---------|
| @prisma/client | 7.8.0 | Write Result/Issue/CausalEdge records |
| @prisma/adapter-neon + @neondatabase/serverless | 7.8.0 / 1.1.0 | Neon connection adapter (already in crawler, confirmed by Phase 2 Bug 2 fix) |
| zod | 4.4.3 | Validate LLM tool call output before DB write |
| typescript | 6.0.3 | Type-safe pipeline implementation |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@google/generative-ai` | Raw `fetch` to `generativelanguage.googleapis.com` | SDK handles retries, type safety, and streaming; raw fetch is more code for no benefit |
| `gemini-2.0-flash` for both Stage 2 + 3 | `gemini-1.5-flash` for Stage 3 | 1.5-flash is available but 2.0-flash has better instruction following on free tier; use 2.0-flash for both |
| Function calling (forced) for Stage 2 | System prompt + JSON extraction | `functionCallingConfig: { mode: FunctionCallingMode.ANY }` guarantees structured JSON without regex parsing; extraction is fragile |

**Installation (in `crawler/` only):**
```bash
sfw npm install @google/generative-ai
```

---

## Package Legitimacy Audit

> slopcheck run via `py -m slopcheck install "@google/generative-ai"` on 2026-05-26.
> Postinstall script check: `npm view @google/generative-ai scripts.postinstall` — returned no postinstall key.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| @google/generative-ai | npm | 2+ yrs | high (official Google AI SDK) | github.com/google-gemini/generative-ai-js | [OK] | Approved |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Codebase Context: What Phase 3 Receives and Writes

### Signal Inputs (from `crawler/src/lib/types.ts` — VERIFIED by direct file read)

Phase 3 receives a `{ mobile: CrawlPass, desktop: CrawlPass }` object where each `CrawlPass` contains:

**DOMSignals** — structural/accessibility:
- `maxDOMDepth`, `totalElementCount`, `interactiveElementCount`
- `ariaLabelledCount`, `ariaRoleCount`, `ariaLandmarkCount`, `missingAltCount`
- `semanticScore: { h1Count, h2Count, h3Count, navCount, mainCount, footerCount, articleCount, hasSkipLink }`
- `formCount`, `formFieldCount`, `formWithoutLabelCount`
- `ctaVisibility: { buttonCount, visibleButtonCount, primaryCtaText }`

**CSSSignals** — paint/animation performance:
- `totalCSSBytes`, `unusedCSSBytes`, `unusedCSSPercent`
- `animationCount`, `transitionCount`, `willChangeCount`, `paintTriggerPropertyCount`
- `fontDisplayStrategies: { block, swap, fallback, optional, auto }`

**JSSignals** — loading behavior:
- `totalJSBytes`, `scriptCount`, `renderBlockingCount`
- `asyncScriptCount`, `deferredScriptCount`, `moduleScriptCount`, `thirdPartyScriptCount`
- `frameworkFingerprint: string[]`, `unusedJSBytes`, `unusedJSPercent`

**NetworkSignals** — request waterfall:
- `totalRequests`, `totalTransferSize`, `renderBlockingCount`, `renderBlockingAssets`
- `cdnCount`, `firstRequestTTFB`, `maxTTFB`
- `imageCount`, `oversizedImageCount`, `totalImageBytes`
- `entries: HAREntry[]` (full waterfall with DNS/TLS/TTFB per request)

### DB Write Targets (from `prisma/schema.prisma` — VERIFIED by direct file read)

```
Result { id, jobId (unique), narrative: Json, issues: Issue[], edges: CausalEdge[], created_at }
Issue  { id, resultId, category, signal_source, severity: Int, raw_evidence, technical_description }
CausalEdge { id, resultId, fromIssueId, toIssueId, relationship, confidence, mechanism (NON-NULLABLE), explanation }
```

Key field constraints to observe:
- `Issue.severity` is an `Int` — the planner should map Critical=4, High=3, Medium=2, Low=1 (or Critical=1..4 — define in scoring stage, be consistent)
- `CausalEdge.mechanism` is **non-nullable** — schema-level enforcement; any `prisma.causalEdge.create({})` without `mechanism` will throw a runtime error [VERIFIED: schema.prisma]
- `Result.narrative` is `Json` — store as a structured object `{ summary: string, perceivedPerformance: string, technicalPerformance: string, recommendations: string[] }` to make Phase 4 rendering easy
- `Issue.raw_evidence` is a `String` — store the specific signal values that triggered the issue (e.g., `"firstRequestTTFB: 2400ms"`)

### Integration Point (from `crawler/src/processor.ts` — VERIFIED by direct file read)

```typescript
// Line 39 in processor.ts — this is the exact stub to replace:
// TODO Phase 3: invoke AI pipeline with _signals, write Result/Issue/CausalEdge records
await prisma.job.update({ where: { id: jobId }, data: { status: 'complete' } })
```

The pipeline replaces the stub between `status: 'analyzing'` (line 37) and `status: 'complete'` (line 40). The variable is `_signals` (with underscore prefix indicating intentional in-memory-only pattern per Phase 2 INFRA-03 compliance).

---

## Architecture Patterns

### System Architecture Diagram

```
processor.ts
  │  status → 'analyzing'
  │  const _signals = { mobile, desktop }
  │
  ├── stage1-scorer.ts (SYNC — pure functions, no I/O)
  │     │  Input: CrawlPass (mobile) + CrawlPass (desktop)
  │     │  Logic: threshold rules per signal type
  │     │  Output: ScoredIssue[] (severity, category, signal_source, raw_evidence)
  │     │
  │     ▼
  │   [ScoredIssue[], length 0..N]
  │
  ├── stage2-reasoner.ts (ASYNC — Gemini API call)
  │     │  Input: ScoredIssue[]
  │     │  Model: gemini-2.0-flash
  │     │  Method: functionCallingConfig: { mode: FunctionCallingMode.ANY }
  │     │  Output: EnrichedIssue[] (+ technical_description per issue)
  │     │          CausalEdgeCandidate[] (fromIssueIndex, toIssueIndex, mechanism, relationship, confidence)
  │     │
  │     ▼
  │   [EnrichedIssue[], CausalEdgeCandidate[]]
  │
  ├── stage3-narrator.ts (ASYNC — Gemini API call)
  │     │  Input: EnrichedIssue[], CausalEdgeCandidate[]
  │     │  Model: gemini-2.0-flash
  │     │  Method: plain text output (no function calling needed)
  │     │  Output: NarrativeResult { summary, perceivedPerformance, technicalPerformance, recommendations }
  │     │
  │     ▼
  │   [NarrativeResult]
  │
  └── prisma DB writes
        │  prisma.result.create({ narrative, issues: { create: [...] }, edges: { create: [...] } })
        │
        ▼
  status → 'complete'
```

### Recommended Project Structure

```
crawler/src/
├── pipeline/
│   ├── stage1-scorer.ts      # Pure deterministic scoring — AI-01
│   ├── stage2-reasoner.ts    # LLM reasoning + causality — AI-02
│   ├── stage3-narrator.ts    # LLM narration — AI-03, AI-04
│   ├── types.ts              # ScoredIssue, EnrichedIssue, CausalEdgeCandidate, NarrativeResult
│   └── run-pipeline.ts       # Orchestrator: calls all 3 stages + DB writes
├── lib/
│   ├── gemini.ts             # Google Gemini SDK singleton (lazy init, GEMINI_API_KEY)
│   ├── prisma.ts             # (existing)
│   └── types.ts              # (existing signal types)
├── processor.ts              # (existing — wires run-pipeline replacing TODO stub)
└── ...
```

### Pattern 1: Deterministic Scoring Thresholds (Stage 1 — AI-01)

**What:** A set of threshold rules applied to each signal field. No LLM. Output is a flat `ScoredIssue[]`.

**Why:** AI-01 explicitly requires deterministic thresholds, not LLM inference. This stage must be 100% reproducible.

**Severity mapping:** `Critical = 4`, `High = 3`, `Medium = 2`, `Low = 1` (maps to `Issue.severity: Int`).

**Recommended threshold table** [ASSUMED — these are research-informed defaults; planner/user should confirm before locking]:

| Signal Field | Viewport | Threshold | Severity | Category | Rationale |
|---|---|---|---|---|---|
| `networkSignals.firstRequestTTFB` | Both | > 2000ms | Critical | perceived-perf | TTFB > 2s is a clear slow-start signal; perceived as "site is slow" |
| `networkSignals.firstRequestTTFB` | Both | > 800ms | High | perceived-perf | Google Core Web Vitals "needs improvement" threshold |
| `networkSignals.firstRequestTTFB` | Both | > 400ms | Medium | technical-perf | Above ideal for CDN-served content |
| `networkSignals.renderBlockingCount` | Both | > 5 | Critical | technical-perf | Many render-blocking resources severely delay First Contentful Paint |
| `networkSignals.renderBlockingCount` | Both | > 2 | High | technical-perf | Measurable impact on FCP |
| `networkSignals.oversizedImageCount` | Both | > 5 | High | perceived-perf | Oversized images slow perceived load on mobile especially |
| `networkSignals.oversizedImageCount` | Both | > 2 | Medium | perceived-perf | Moderate image weight |
| `jsSignals.totalJSBytes` | Mobile | > 500_000 | Critical | technical-perf | 500KB JS on mobile is a severe parsing/execution burden |
| `jsSignals.totalJSBytes` | Mobile | > 300_000 | High | technical-perf | 300KB JS noticeably slow on slow-3G |
| `jsSignals.renderBlockingCount` | Both | > 3 | High | technical-perf | Render-blocking scripts delay interactivity |
| `jsSignals.renderBlockingCount` | Both | > 1 | Medium | technical-perf | Any render-blocking scripts have impact |
| `jsSignals.unusedJSPercent` | Both | > 60 | High | technical-perf | More than 60% unused JS is significant waste |
| `jsSignals.unusedJSPercent` | Both | > 40 | Medium | technical-perf | 40%+ unused JS indicates poor code splitting |
| `cssSignals.unusedCSSPercent` | Both | > 80 | High | technical-perf | >80% unused CSS indicates no critical CSS extraction |
| `cssSignals.unusedCSSPercent` | Both | > 60 | Medium | technical-perf | Moderate CSS bloat |
| `cssSignals.fontDisplayStrategies.block` | Both | > 0 | High | perceived-perf | `font-display: block` causes FOIT — text invisible until font loads, major perceived-perf issue |
| `cssSignals.paintTriggerPropertyCount` | Both | > 20 | High | technical-perf | Many paint-triggering animations risk jank on mobile |
| `domSignals.missingAltCount` | Both | > 10 | High | accessibility | Many images missing alt text, accessibility + SEO impact |
| `domSignals.missingAltCount` | Both | > 3 | Medium | accessibility | Some images missing alt text |
| `domSignals.formWithoutLabelCount` | Both | > 0 | High | accessibility | Any unlabelled form fields are a usability + accessibility issue |
| `domSignals.maxDOMDepth` | Both | > 32 | High | technical-perf | Deep DOM increases layout recalc time |
| `domSignals.maxDOMDepth` | Both | > 20 | Medium | technical-perf | Moderately deep DOM |
| `networkSignals.cdnCount` | Both | === 0 | Medium | technical-perf | No CDN detected — assets served from origin only |

**Deduplication rule:** When both mobile and desktop passes produce the same issue type (e.g., both exceed a TTFB threshold), emit one issue. Prefer the worse viewport's value as `raw_evidence`. Emit a second issue only if one viewport triggers a higher severity than the other.

**ScoredIssue type (to define in `pipeline/types.ts`):**
```typescript
export interface ScoredIssue {
  category: 'perceived-perf' | 'technical-perf' | 'accessibility'
  signal_source: string       // e.g. "networkSignals.firstRequestTTFB (mobile)"
  severity: 1 | 2 | 3 | 4    // 1=Low, 2=Medium, 3=High, 4=Critical
  raw_evidence: string        // e.g. "2400ms (threshold: >2000ms Critical)"
  viewport: 'mobile' | 'desktop' | 'both'
}
```

### Pattern 2: LLM Reasoning Stage (Stage 2 — AI-02)

**What:** Call `gemini-2.0-flash` with the scored issue list. Force a specific function call (`emit_analysis`) that produces per-issue `technical_description` and causality edges. The system prompt explicitly instructs the model: it may ONLY reference issues in the input list — it cannot invent new issues.

**Why forced function calling:** `functionCallingConfig: { mode: FunctionCallingMode.ANY }` guarantees the response is always a parseable JSON function call with no free-form preamble. Without this, the model may return a text block instead, requiring fragile extraction.

**No prompt caching:** The free tier (Google AI Studio) does not support prompt caching. Keep system prompts static for consistency but no cache_control is needed.

```typescript
// crawler/src/pipeline/stage2-reasoner.ts
import { GoogleGenerativeAI, SchemaType, FunctionCallingMode } from '@google/generative-ai'

const EMIT_ANALYSIS_TOOL = {
  functionDeclarations: [{
    name: 'emit_analysis',
    description: 'Emit structured analysis: per-issue explanations and causality edges.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        enriched_issues: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              index: { type: SchemaType.NUMBER, description: 'Zero-based index into the input scored_issues array' },
              technical_description: { type: SchemaType.STRING, description: 'Plain-English explanation (1-3 sentences)' },
            },
            required: ['index', 'technical_description'],
          },
        },
        causal_edges: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              from_index: { type: SchemaType.NUMBER },
              to_index: { type: SchemaType.NUMBER },
              mechanism: { type: SchemaType.STRING, description: 'Must be one of the 13 permitted mechanism strings' },
              relationship: { type: SchemaType.STRING },
              confidence: { type: SchemaType.STRING, description: 'high | medium | low' },
              explanation: { type: SchemaType.STRING },
            },
            required: ['from_index', 'to_index', 'mechanism', 'relationship', 'confidence', 'explanation'],
          },
        },
      },
      required: ['enriched_issues', 'causal_edges'],
    },
  }],
}

export async function runStage2Reasoning(
  client: GoogleGenerativeAI,
  scoredIssues: ScoredIssue[]
): Promise<{ enrichedIssues: EnrichedIssue[]; edges: CausalEdgeCandidate[] }> {
  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    tools: [EMIT_ANALYSIS_TOOL],
    toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.ANY, allowedFunctionNames: ['emit_analysis'] } },
  })

  const result = await model.generateContent({
    systemInstruction: SYSTEM_PROMPT,
    contents: [{ role: 'user', parts: [{ text: `Analyze these scored UX issues:\n\n${JSON.stringify(scoredIssues, null, 2)}` }] }],
  })

  const functionCall = result.response.functionCalls()?.[0]
  if (!functionCall) throw new Error('Stage 2: expected function call not returned by model')

  const raw = functionCall.args as Record<string, unknown>
  return parseStage2Output(raw, scoredIssues)
}
```

### Pattern 3: LLM Narration Stage (Stage 3 — AI-03, AI-04)

**What:** Call `gemini-2.0-flash` with the enriched issue list and causality edges. Generate a 2–4 paragraph plain-English narrative. The prompt explicitly requires a perceived-vs-technical distinction (AI-04).

**Why no function calling here:** Narration is free-form text. Function calling adds overhead and doesn't constrain the narrative in useful ways. Use a plain text response and parse the structured sections using separator markers.

**AI-04 enforcement:** The system prompt requires specific labeled sections in the output. The planner should design the prompt to include markers like `[PERCEIVED PERFORMANCE]` and `[TECHNICAL PERFORMANCE]` so Phase 4 can render them as separate sections.

```typescript
export async function runStage3Narration(
  client: GoogleGenerativeAI,
  enrichedIssues: EnrichedIssue[],
  edges: CausalEdgeCandidate[]
): Promise<NarrativeResult> {
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const result = await model.generateContent({
    systemInstruction: NARRATOR_SYSTEM_PROMPT,
    contents: [{ role: 'user', parts: [{ text: `Generate UX narrative:\n\nIssues:\n${JSON.stringify(enrichedIssues, null, 2)}\n\nCausal chains:\n${JSON.stringify(edges, null, 2)}` }] }],
  })

  const text = result.response.text()
  return parseNarrativeOutput(text)
}
```

**`parseNarrativeOutput`** splits on the `[SECTION]` markers and returns:
```typescript
export interface NarrativeResult {
  summary: string
  perceivedPerformance: string
  technicalPerformance: string
  recommendations: string[]
}
```
This shape maps directly to `Result.narrative: Json` in the Prisma schema.

### Pattern 4: Zod Validation of Tool Call Output

**What:** Before writing Stage 2 output to the DB, validate the tool call input against a zod schema. This catches cases where the model returns an out-of-range mechanism or a `from_index` that points to a non-existent issue.

**Why:** Even with forced tool use, the model can return tool inputs that fail business rules (e.g., a mechanism string not in the allowed list, or index out of bounds). Zod validation at the boundary prevents corrupt DB writes.

```typescript
import { z } from 'zod/v4'

// Permitted mechanism strings (must match CAUSALITY_MECHANISM_RULES in stage2-reasoner.ts)
const PERMITTED_MECHANISMS = [
  'render-blocking-delays-fcp',
  'ttfb-delays-fcp',
  'large-js-bundle-delays-tti',
  'render-blocking-js-delays-tti',
  'unused-js-inflates-bundle',
  'font-block-causes-foit',
  'missing-cdn-increases-ttfb',
  'oversized-images-increase-lcp',
  'deep-dom-increases-layout-cost',
  'paint-trigger-properties-cause-jank',
  'unlabelled-forms-block-conversion',
  'excessive-css-inflates-render-blocking',
  'third-party-scripts-contend-bandwidth',
] as const

const Stage2OutputSchema = z.object({
  enriched_issues: z.array(z.object({
    index: z.number().int().min(0),
    technical_description: z.string().min(1).max(500),
  })),
  causal_edges: z.array(z.object({
    from_index: z.number().int().min(0),
    to_index: z.number().int().min(0),
    mechanism: z.enum(PERMITTED_MECHANISMS),
    relationship: z.string().min(1).max(50),
    confidence: z.enum(['high', 'medium', 'low']),
  })).max(5),
})
```

### Pattern 5: Gemini SDK Singleton

```typescript
// crawler/src/lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

let _client: GoogleGenerativeAI | null = null

export function getGeminiClient(): GoogleGenerativeAI {
  if (_client === null) {
    _client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')
  }
  return _client
}
```

### Pattern 6: DB Write After All Stages

```typescript
// crawler/src/pipeline/run-pipeline.ts
import { prisma } from '../lib/prisma'

export async function runAIPipeline(
  jobId: string,
  signals: { mobile: CrawlPass; desktop: CrawlPass }
): Promise<void> {
  const client = getGeminiClient()

  // Stage 1: deterministic scoring
  const scoredIssues = scoreSignals(signals.mobile, signals.desktop)

  if (scoredIssues.length === 0) {
    // No issues found — write empty result and finish
    await prisma.result.create({
      data: {
        jobId,
        narrative: { summary: 'No significant issues found.', perceivedPerformance: '', technicalPerformance: '', recommendations: [] },
      },
    })
    return
  }

  // Stage 2: LLM reasoning
  const { enrichedIssues, edges } = await runStage2Reasoning(client, scoredIssues)

  // Stage 3: LLM narration
  const narrative = await runStage3Narration(client, enrichedIssues, edges)

  // Single DB transaction: create Result + all Issues + all CausalEdges
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

    // Create CausalEdges referencing the newly created Issue IDs
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
}
```

**Note on Prisma nested writes vs `createMany`:** `prisma.result.create` with `include: { issues: true }` returns the created issues with their generated IDs, which are needed to populate `fromIssueId`/`toIssueId` in `CausalEdge`. The nested `issues.create` inside the `result.create` is the correct pattern; `createMany` cannot be used there because it does not return IDs. [ASSUMED — based on Prisma nested write behavior from training knowledge; verify against Prisma 7 docs if behavior changed]

### Anti-Patterns to Avoid

- **Single-shot LLM on raw HTML or raw signals:** STATE.md explicitly records "single-shot LLM on raw HTML produces hallucinations and costs 30-60x more." The three-stage pipeline exists to prevent this.
- **LLM inventing severity:** AI-01 requires deterministic thresholds. Never pass raw signals to the LLM and ask it to infer severity labels — this is untestable and inconsistent.
- **`null` mechanism on CausalEdge:** The schema is non-nullable. Any code path that creates a `CausalEdge` without `mechanism` will throw `P2000`/null constraint errors at runtime.
- **Parsing free-form LLM JSON via regex:** Use `tool_choice: { type: "tool" }` for structured output in Stage 2 so the SDK guarantees the response is a tool call block. Never use regex to extract JSON from a text response.
- **Storing raw signals in DB:** INFRA-03 prohibits this. `_signals` in `processor.ts` must not be serialized to any DB table.
- **Skipping zod validation:** Even with tool_use, model output can violate business rules. Always validate `mechanism` strings against the permitted list before creating a `CausalEdge`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Structured JSON from LLM | Regex extraction from text | `functionCallingConfig: { mode: FunctionCallingMode.ANY }` + zod | Function calling guarantees a parseable JSON block; regex is fragile and untestable |
| LLM API client (retries, auth, types) | Raw fetch with manual retry | `@google/generative-ai` | SDK handles type-safe request/response; streaming available if needed |
| Causality mechanism validation | String comparison in imperative code | `z.enum(PERMITTED_MECHANISMS)` | Zod enum validates at parse time; throws with clear error if mechanism is not in the list |
| DB transaction for Result + Issues + Edges | Sequential `prisma.create` calls | `prisma.$transaction` | Ensures atomicity — if edge creation fails, the result is not written in a half-complete state |
| Severity label logic | LLM inference | Threshold table in `stage1-scorer.ts` | Deterministic, unit-testable, consistent — the only valid approach per AI-01 |

**Key insight:** The three-stage pipeline exists precisely because hand-rolling a single LLM call produces hallucinations and costs 30-60x more per STATE.md. Each stage is designed to be independently testable: Stage 1 is pure functions (Vitest unit tests), Stage 2 output can be tested with a mock Gemini client, Stage 3 can be tested against a fixture narrative.

---

## Common Pitfalls

### Pitfall 1: `CausalEdge.mechanism` Null Constraint at Runtime

**What goes wrong:** `prisma.causalEdge.create({ ... })` throws `P2000` or a null-constraint error if `mechanism` is missing or an empty string.

**Why it happens:** The Prisma schema marks `mechanism String` as non-nullable (no `?`). The comment in `schema.prisma` explicitly documents this: "NON-NULLABLE — schema-level enforcement (D-17); Prisma rejects any create without this field." A model response that omits a mechanism (e.g., due to output length truncation or an unexpected stop reason) will crash the DB write.

**How to avoid:** Always validate Stage 2 output through the zod schema before any DB writes. The `z.enum(PERMITTED_MECHANISMS)` check will reject any edge with a missing or off-list mechanism. Log the rejection and skip the edge rather than crashing the entire pipeline.

**Warning signs:** `P2000` or `null constraint failed` errors in crawler logs after Stage 2.

---

### Pitfall 2: Function Calling Mode Not Forced — Model Returns Text Instead

**What goes wrong:** Without `functionCallingConfig: { mode: FunctionCallingMode.ANY }`, the Gemini model may return a plain text response instead of a function call, causing `result.response.functionCalls()` to return `undefined`.

**Why it happens:** The default function calling mode allows the model to decide whether to call a function or respond in text. For Stage 2, structured output is required.

**How to avoid:** Always set `toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.ANY, allowedFunctionNames: ['emit_analysis'] } }` when calling Stage 2. Check `functionCalls()?.[0]` and throw if absent.

**Warning signs:** `Stage 2: expected function call not returned by model` error in crawler logs.

---

### Pitfall 3: Stage 2 Produces `from_index === to_index` Self-Edges

**What goes wrong:** The model occasionally emits a causal edge where `from_index` and `to_index` reference the same scored issue, creating a self-loop in the causality graph.

**Why it happens:** The model may reason that an issue both causes and is affected by itself (e.g., oversized images causing perceived slowness when they are already the perceived slowness issue). Self-edges are logically meaningless and will likely cause rendering issues in Phase 4's React Flow graph.

**How to avoid:** Add a post-validation filter in `parseStage2Output`: discard any edge where `from_index === to_index`. Add this check to the zod refinement: `z.refine(edge => edge.from_index !== edge.to_index, { message: 'Self-edges are not permitted' })`.

**Warning signs:** Phase 4 React Flow graph shows a node with an arrow pointing to itself.

---

### Pitfall 5: LLM Invents Issues Not In Scored List

**What goes wrong:** Stage 2 returns `enriched_issues` with an `index` value that exceeds the length of `scoredIssues`. If this is written to the DB without validation, it produces a dangling reference or an out-of-bounds array access crash.

**Why it happens:** The model may miscount the 0-based indices or hallucinate an issue that "should" have been in the list.

**How to avoid:** After stage 2, validate all `index` values are in range `[0, scoredIssues.length)`. Discard out-of-range entries. If more than 50% of returned indices are invalid, log a warning and proceed with empty enrichment rather than crashing the job.

**Warning signs:** `TypeError: Cannot read properties of undefined (reading 'id')` when mapping `result.issues[edge.fromIndex]` in the DB write.

---

### Pitfall 6: Gemini Free Tier Rate Limiting During Development

**What goes wrong:** Repeated end-to-end test runs hit Gemini free tier rate limits (requests per minute), causing HTTP 429 errors and job failures.

**Why it happens:** Google AI Studio free tier has strict per-minute request limits. During development with many test crawls, two pipeline calls per job (Stage 2 + Stage 3) accumulate quickly.

**How to avoid:** (1) Use a fixture/mock for Gemini client in unit tests rather than live API calls. (2) In integration testing, use a single canonical test URL (e.g., `https://nextjs.org`) rather than testing with 10 different URLs simultaneously.

**Warning signs:** HTTP 429 errors in crawler logs during development.

---

## Perceived vs Technical Performance (AI-04)

AI-04 is a cross-cutting requirement that affects both Stage 2 and Stage 3:

**In Stage 1 (scoring):** The `category` field on each `ScoredIssue` must be one of `'perceived-perf' | 'technical-perf' | 'accessibility'`. This classification is built into the threshold table above — each rule has a pre-assigned category. The two-category split is the foundation for the distinction AI-04 requires.

**In Stage 2 (reasoning):** The system prompt instructs the model to "distinguish perceived performance (what the user feels) from technical performance (measurable metrics) in your technical_description fields." Example: for `firstRequestTTFB > 2000ms`, the technical_description should mention both "the server takes 2.4 seconds before sending the first byte" (technical) AND "users perceive the page as unresponsive for the first few seconds" (perceived).

**In Stage 3 (narration):** The prompt enforces two labeled sections: `[PERCEIVED PERFORMANCE]` (how it feels, human language only) and `[TECHNICAL PERFORMANCE]` (metric values, for developers). The `parseNarrativeOutput` function maps these to `NarrativeResult.perceivedPerformance` and `NarrativeResult.technicalPerformance` respectively, which are stored in `Result.narrative: Json`. Phase 4 renders them as separate labeled sections.

**The key insight for AI-04:** TTFB is a technical metric, but its effect is perceived as "the page hangs before anything appears." Render-blocking JS is a technical issue, but its effect is "the page is blank and unresponsive for several seconds on mobile." The pipeline must thread this translation through all three stages — scoring → reasoning → narration — so the Phase 4 dashboard can show both dimensions to mixed audiences (PMs and developers).

---

## Code Examples

### Gemini SDK — Forced Function Calling (Stage 2)
```typescript
const model = client.getGenerativeModel({
  model: 'gemini-2.0-flash',
  tools: [EMIT_ANALYSIS_TOOL],
  toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.ANY, allowedFunctionNames: ['emit_analysis'] } },
})
const result = await model.generateContent({
  systemInstruction: SYSTEM_PROMPT,
  contents: [{ role: 'user', parts: [{ text: userContent }] }],
})
const functionCall = result.response.functionCalls()?.[0]
```

### Gemini SDK — Plain Text Output (Stage 3)
```typescript
const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' })
const result = await model.generateContent({
  systemInstruction: NARRATOR_SYSTEM_PROMPT,
  contents: [{ role: 'user', parts: [{ text: userContent }] }],
})
const text = result.response.text()
```

### Prisma Transaction (Atomic Write)
```typescript
// Source: Prisma docs on interactive transactions [ASSUMED — verify pattern for Prisma 7]
await prisma.$transaction(async (tx) => {
  const result = await tx.result.create({ data: { jobId, narrative, issues: { create: issuesData } }, include: { issues: true } })
  if (edges.length > 0) {
    await tx.causalEdge.createMany({ data: edgesData.map((e, i) => ({ ...e, fromIssueId: result.issues[e.fromIndex].id, toIssueId: result.issues[e.toIndex].id })) })
  }
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| Single-shot LLM on raw HTML | 3-stage: deterministic scoring → LLM reasoning → LLM narration | 2023–2024 (prompt engineering maturity) | 30-60x cost reduction; eliminates hallucinated issues |
| Regex extraction from LLM JSON | Forced function calling + zod validation | Gemini function calling GA | Reliable structured output without parsing hacks |
| Hard-code model string | Use `gemini-2.0-flash` | Gemini 2.0 generation | Pinned model name; update explicitly when upgrading |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|---|---|---|---|---|
| GEMINI_API_KEY | Stage 2 + Stage 3 | Needs provisioning | — | No fallback — pipeline fails without it |
| @google/generative-ai | Stage 2 + Stage 3 | Not yet installed in crawler | latest | — |
| Neon DB (PrismaNeon adapter) | Result/Issue/CausalEdge writes | ✓ (Phase 2 confirmed) | Prisma 7.8.0 | — |
| Fly.io crawler service | Pipeline execution location | ✓ (Phase 2 deployed locally/ngrok) | — | — |

**Missing dependencies requiring action:**
- `GEMINI_API_KEY` must be set in the crawler environment (Fly.io secrets for production; `crawler/.env` for local dev). Wave 0 must include a human-checkpoint for this.
- `@google/generative-ai` must be installed in `crawler/` with `sfw npm install @google/generative-ai`.

---

## Validation Architecture

### Test Framework
| Property | Value |
|---|---|
| Framework | Vitest (root `vitest.config.mts`) |
| Config file | `vitest.config.mts` (project root — includes `crawler/src/**/*.test.ts`) |
| Quick run command | `npm test -- --run crawler/src/pipeline` |
| Full suite command | `npm test -- --run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|---|---|---|---|---|
| AI-01 | Stage 1 scorer produces correct severity for known signal values | unit | `npm test -- --run crawler/src/pipeline/stage1-scorer.test.ts` | ❌ Wave 0 |
| AI-01 | Deduplication: mobile + desktop same issue emits one record | unit | same file | ❌ Wave 0 |
| AI-02 | Stage 2 zod schema rejects out-of-list mechanism string | unit | `npm test -- --run crawler/src/pipeline/stage2-reasoner.test.ts` | ❌ Wave 0 |
| AI-02 | Self-edge filter removes from_index === to_index edges | unit | same file | ❌ Wave 0 |
| AI-03 | Stage 3 parser splits narrative into 4 sections correctly | unit | `npm test -- --run crawler/src/pipeline/stage3-narrator.test.ts` | ❌ Wave 0 |
| AI-04 | Scoring table assigns `perceived-perf` category to TTFB and font-block issues | unit | stage1-scorer.test.ts | ❌ Wave 0 |
| AI-04 | Narration parser extracts perceivedPerformance and technicalPerformance fields | unit | stage3-narrator.test.ts | ❌ Wave 0 |

**Note:** Stage 2 and Stage 3 LLM calls cannot be unit-tested without a mock. The tests above cover the parsing/validation logic (zod schemas, parseStage2Output, parseNarrativeOutput) using fixture inputs. Live LLM calls are covered by the end-to-end smoke test in the final wave.

### Wave 0 Gaps
- [ ] `crawler/src/pipeline/stage1-scorer.test.ts` — AI-01 threshold rules
- [ ] `crawler/src/pipeline/stage2-reasoner.test.ts` — zod validation, self-edge filter
- [ ] `crawler/src/pipeline/stage3-narrator.test.ts` — narrative parser, section extraction

*(No framework gaps — Vitest already configured and running 27 tests from Phase 2)*

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---|---|---|
| V2 Authentication | no | No user auth in MVP |
| V3 Session Management | no | Stateless job pipeline |
| V4 Access Control | yes | GEMINI_API_KEY must be secret — never log, never expose in responses |
| V5 Input Validation | yes | Zod validation on all LLM tool call outputs before DB write |
| V6 Cryptography | no | No custom crypto — SDK handles HTTPS |

### Known Threat Patterns for AI Pipeline

| Pattern | STRIDE | Standard Mitigation |
|---|---|---|
| Prompt injection via page content | Tampering | Signals are numeric/enumerated values only — no raw HTML, no page text passes to the LLM; signals are aggregated counts, not strings extracted from page |
| LLM cost explosion (unbounded jobs) | Denial of Service | INFRA-02 rate-limits submissions per IP; free tier limits bound per-job spend naturally |
| GEMINI_API_KEY exposure | Information Disclosure | Set via Fly.io secrets (not .env committed to git); never log; never include in error messages |
| LLM inventing issues (hallucination) | Tampering | Zod index validation: any enriched_issue.index outside [0, scoredIssues.length) is discarded; mechanism enum rejects invented strings |
| Stale Prisma schema causing runtime errors | Tampering | Non-nullable mechanism enforced at schema level; zod validates before create |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|---|---|---|
| A1 | Scoring thresholds (e.g., TTFB > 2000ms = Critical) are sensible defaults | Pattern 1 scoring table | Wrong thresholds produce too many or too few issues; table is a starting point that should be validated against 3+ real sites per STATE.md active todo |
| A2 | `prisma.$transaction` with nested `result.create` + `include: { issues: true }` returns created issue IDs usable in `causalEdge.createMany` in Prisma 7 | Pattern 6 DB write | If Prisma 7 changed `$transaction` interactive behavior, must use sequential creates with explicit ID tracking instead |
| A3 | `functionCallingConfig: { mode: FunctionCallingMode.ANY }` is stable in `@google/generative-ai` latest | Patterns 2 | If SDK type definitions change, verify import of `FunctionCallingMode` enum from `@google/generative-ai` |
| A4 | The 13 causality mechanism strings in `CAUSALITY_MECHANISM_RULES` are sufficient for MVP | Stage 2 prompt | If real-site testing reveals missing mechanisms, add to the list before shipping; the list is version-controllable |
| A5 | `zod/v4` import (`from 'zod/v4'`) is the correct import path for zod 4.4.3 (as used in existing crawler code) | Pattern 4 | If import path changed, use `from 'zod'` instead |

---

## Open Questions (RESOLVED)

1. **Severity integer mapping: Critical=4 or Critical=1?**
   - What we know: `Issue.severity` is `Int` in the Prisma schema. The threshold table uses Critical=4.
   - What's unclear: Phase 4 (DASH-01) says "ordered by UX impact severity (Critical first)." If `severity` is sorted `ORDER BY severity DESC`, then Critical=4 is correct for descending sort. If ascending, it's reversed.
   - Recommendation: Define Critical=4, High=3, Medium=2, Low=1 and order by `severity DESC` in Phase 4. Document this mapping in `pipeline/types.ts`.
   - **RESOLVED:** Critical=4, High=3, Medium=2, Low=1 per `SEVERITY_LABELS` constant in `pipeline/types.ts`. Phase 4 orders by `severity DESC` to show Critical issues first.

2. **Schema change needed for `Issue.severity` human-readable label?**
   - What we know: `Issue.severity` is an `Int`. Phase 4 will need to display "Critical" / "High" / "Medium" / "Low" in the UI.
   - What's unclear: Whether Phase 4 should derive the label from the integer (4→Critical), or whether a string field should be added to `Issue`.
   - Recommendation: Derive in the Phase 4 display layer, not in the DB schema. No schema migration needed for Phase 3. Document the mapping convention in `pipeline/types.ts`.
   - **RESOLVED:** Derive the human-readable label from the integer in the Phase 4 display layer. No schema migration needed in Phase 3. Mapping documented in `pipeline/types.ts` as `SEVERITY_LABELS`.

3. **Zero-issues path: should an empty Result be created?**
   - What we know: Some pages may score zero issues (highly optimized sites). The pipeline must handle this without crashing or hanging in `analyzing` state.
   - Recommendation: Create a `Result` with empty `issues` and `edges` arrays and a narrative of "No significant issues found. This page performs well across the measured signal categories." Skip Stage 2 and Stage 3 calls entirely to avoid unnecessary API spend.
   - **RESOLVED:** Create empty Result with hardcoded narrative `"No significant issues found."` when Stage 1 returns zero issues. Skip Stage 2 and Stage 3 calls entirely. Implemented in `run-pipeline.ts` early-return branch.

---

## Sources

### Primary (HIGH confidence)
- [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models) — confirmed `gemini-2.0-flash` as the correct model ID for free tier
- [ai.google.dev/gemini-api/docs/function-calling](https://ai.google.dev/gemini-api/docs/function-calling) — `functionCallingConfig: { mode: FunctionCallingMode.ANY }` pattern; `functionDeclarations` schema; forced function calling
- `crawler/src/lib/types.ts` — canonical signal type interfaces, read directly from source
- `crawler/src/processor.ts` — confirmed TODO stub location (line 39), `_signals` variable name
- `prisma/schema.prisma` — confirmed `Issue.severity: Int`, `CausalEdge.mechanism: String` (non-nullable), `Result.narrative: Json`
- slopcheck: `@google/generative-ai` → [OK]

### Secondary (MEDIUM confidence)
- `crawler/package.json` — confirmed existing dependencies (zod 4.4.3, @prisma/adapter-neon, @neondatabase/serverless)
- `.planning/phases/02-crawler-service/02-CONTEXT.md` — Phase 2 decisions, signal type contracts
- `.planning/STATE.md` — causality graph cap (3-5 edges), 3-stage pipeline rationale, active todos

### Tertiary (LOW confidence)
- Scoring threshold values in Pattern 1 table — research-informed but not from an authoritative source; tagged [ASSUMED]; must be validated against real sites

---

## Metadata

**Confidence breakdown:**
- Standard stack (@google/generative-ai): HIGH — slopcheck confirmed; official Google AI SDK
- SDK API patterns (function calling): HIGH — official Google AI docs verified
- Signal input types: HIGH — read directly from `crawler/src/lib/types.ts`
- DB schema field constraints: HIGH — read directly from `prisma/schema.prisma`
- Processor stub integration point: HIGH — read directly from `crawler/src/processor.ts`
- Scoring threshold values: LOW — reasonable defaults based on industry knowledge; must be user-confirmed

**Research date:** 2026-05-26
**Valid until:** 2026-07-26 (60 days — Gemini SDK and model IDs are stable; schema is locked by D-17)
