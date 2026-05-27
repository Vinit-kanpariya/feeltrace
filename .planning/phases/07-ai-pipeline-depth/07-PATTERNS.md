# Phase 7: AI Pipeline Depth — Pattern Map

**Mapped:** 2026-05-27
**Files analyzed:** 9 new/modified files
**Analogs found:** 9 / 9

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `crawler/src/pipeline/stage1-5-vision-scanner.ts` | service | request-response (LLM call) | `crawler/src/pipeline/stage2-reasoner.ts` | role-match (same tool-call pattern, different model) |
| `crawler/src/pipeline/stage2-reasoner.ts` | service | request-response (LLM call) | self | exact (field additions only) |
| `crawler/src/pipeline/stage3-narrator.ts` | service | request-response (LLM call) | self | exact (signature + prompt additions only) |
| `crawler/src/pipeline/page-type-detector.ts` | utility | transform (pure function) | `crawler/src/pipeline/stage1-external-scorer.ts` | role-match (deterministic classifier over typed signals) |
| `crawler/src/pipeline/benchmark-context.ts` | utility | transform (pure function) | `crawler/src/pipeline/stage1-external-scorer.ts` | role-match (threshold table lookup → formatted output) |
| `crawler/src/pipeline/run-pipeline.ts` | orchestrator | request-response | self | exact (wiring additions only) |
| `crawler/src/pipeline/types.ts` | model | — | self | exact (interface field additions only) |
| `prisma/schema.prisma` | model | — | self (existing `Issue` model) | exact (column additions only) |
| `src/components/IssueCard.tsx` + `src/app/results/[jobId]/page.tsx` | component / page | request-response | self | exact (prop additions only) |

---

## Pattern Assignments

### `crawler/src/pipeline/stage1-5-vision-scanner.ts` (NEW — service, request-response)

**Analog:** `crawler/src/pipeline/stage2-reasoner.ts`

The vision scanner must follow the exact same structural discipline as Stage 2: static system prompt constant, Groq tool definition literal, Zod validation schema exported for unit testing, a `parseXxx` pure function exported for unit testing, and an async `runXxx` function that calls Groq with forced `tool_choice`. The only differences are the model name, the multimodal message format (image_url content block), and the output shape.

**Imports pattern** (`stage2-reasoner.ts` lines 1–6):
```typescript
import Groq from 'groq-sdk'
import { z } from 'zod/v4'
import type { ScoredIssue, EnrichedIssue, CausalEdgeCandidate } from './types'
import { PERMITTED_MECHANISMS } from './types'
```
For Stage 1.5 replace the type imports with just `ScoredIssue` — visual scanner outputs `ScoredIssue[]` directly.

**System prompt constant pattern** (`stage2-reasoner.ts` lines 12–41):
```typescript
const CAUSALITY_MECHANISM_RULES = `...`.trim()

const SYSTEM_PROMPT = `You are a UX performance analysis engine. ...

${CAUSALITY_MECHANISM_RULES}`
```
Stage 1.5 uses one single `VISION_SYSTEM_PROMPT` constant — no interpolation needed. Place it at the top of the file after imports, same as `SYSTEM_PROMPT` in Stage 2.

**Groq tool definition pattern** (`stage2-reasoner.ts` lines 47–85):
```typescript
const EMIT_ANALYSIS_TOOL: Groq.Chat.Completions.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'emit_analysis',
    description: 'Emit structured analysis: per-issue explanations and causality edges.',
    parameters: {
      type: 'object',
      properties: {
        enriched_issues: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              index: { type: 'number', description: 'Zero-based index into the input scored_issues array' },
              technical_description: { type: 'string', description: 'Plain-English explanation (1-3 sentences)' },
            },
            required: ['index', 'technical_description'],
          },
        },
        // ...
      },
      required: ['enriched_issues', 'causal_edges'],
    },
  },
}
```
Stage 1.5 renames to `EMIT_VISUAL_ISSUES_TOOL` with function name `emit_visual_issues` and a `visual_issues` array. Same JSON schema object shape — `type: 'object'` at root, `properties`, `required`.

**Zod schema export pattern** (`stage2-reasoner.ts` lines 91–107):
```typescript
export const Stage2OutputSchema = z.object({
  enriched_issues: z.array(z.object({
    index: z.number().int().min(0),
    technical_description: z.string().min(1).max(500),
  })),
  causal_edges: z.array(z.object({
    // ...
  })).max(5),
})
```
Stage 1.5 exports `VisualIssuesSchema` following the same pattern. Add `.max(5)` on the array to enforce the cap — same discipline as `causal_edges.max(5)`.

**Parse function pattern** (`stage2-reasoner.ts` lines 113–155):
```typescript
export function parseStage2Output(
  raw: Record<string, unknown>,
  scoredIssues: ScoredIssue[],
): { enrichedIssues: EnrichedIssue[]; edges: CausalEdgeCandidate[] } {
  const parsed = Stage2OutputSchema.parse(raw)
  // ...map and filter...
  return { enrichedIssues, edges }
}
```
Stage 1.5 exports `parseVisualIssues(raw: Record<string, unknown>): ScoredIssue[]` — same signature shape (raw input, typed return), same `Schema.parse(raw)` call first line.

**LLM call + tool extraction pattern** (`stage2-reasoner.ts` lines 161–186):
```typescript
export async function runStage2Reasoning(
  client: Groq,
  scoredIssues: ScoredIssue[],
): Promise<{ enrichedIssues: EnrichedIssue[]; edges: CausalEdgeCandidate[] }> {
  console.log(`[pipeline] Stage 2: analyzing ${scoredIssues.length} scored issues`)

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Analyze these scored UX issues:\n\n${JSON.stringify(scoredIssues, null, 2)}` },
    ],
    tools: [EMIT_ANALYSIS_TOOL],
    tool_choice: { type: 'function', function: { name: 'emit_analysis' } },
    max_tokens: 2048,
  })

  const toolCall = response.choices[0]?.message?.tool_calls?.[0]
  if (!toolCall || toolCall.type !== 'function') {
    throw new Error('Stage 2: expected tool call not returned by model')
  }

  const raw = JSON.parse(toolCall.function.arguments) as Record<string, unknown>
  console.log(`[pipeline] Stage 2: received function call, parsing output`)
  return parseStage2Output(raw, scoredIssues)
}
```
Stage 1.5 differences: model is `'meta-llama/llama-4-scout-17b-16e-instruct'`, user message content is an array (`[{type:'text',...}, {type:'image_url',...}]`), on tool-call failure it returns `[]` (not throws — non-blocking), the function is wrapped in `try/catch` that returns `[]` on error, and there is a buffer-size guard before the API call. All other structure is identical.

**Error handling pattern** (`stage2-reasoner.ts` lines 178–182):
```typescript
const toolCall = response.choices[0]?.message?.tool_calls?.[0]
if (!toolCall || toolCall.type !== 'function') {
  throw new Error('Stage 2: expected tool call not returned by model')
}
```
Stage 1.5 replaces the `throw` with `console.warn(...); return []` — vision scanner is non-blocking. Wrap the entire LLM call block in `try/catch (err) { console.warn('[pipeline] Stage 1.5 vision scan failed:', ...); return [] }`.

---

### `crawler/src/pipeline/stage2-reasoner.ts` (MODIFIED — add fields to existing tool + schema)

**Analog:** self

This is a targeted addition to three locations inside the existing file. Copy the existing field patterns exactly.

**Tool definition — add inside `items.properties` of `enriched_issues`** (after `technical_description` at line 62):
```typescript
// Add AFTER technical_description property (line 62 in existing file):
fix_suggestion: {
  type: 'string',
  description: 'Specific implementation action to fix this issue (e.g. "Add loading=lazy to all below-fold <img> elements", NOT "Consider optimizing images")'
},
severity_justification: {
  type: 'string',
  description: 'Estimated user impact in business terms (e.g. "Users on mobile connections will see a blank screen for 3+ seconds during LCP, increasing bounce rate by an estimated 20-30%")'
},
```

**Tool definition — update `required` array** (line 64, currently `['index', 'technical_description']`):
```typescript
// Replace the existing required array inside enriched_issues items:
required: ['index', 'technical_description', 'fix_suggestion', 'severity_justification'],
```

**Zod schema — add inside `enriched_issues` z.object()** (after `technical_description` at line 93):
```typescript
// Add AFTER technical_description (line 93):
fix_suggestion: z.string().min(1).max(300),
severity_justification: z.string().min(1).max(300),
```
Note: max(300) not max(500) — shorter than `technical_description` to keep per-issue token cost bounded (RESEARCH.md Pitfall 3).

**Parse function — spread new fields in enrichedIssues map** (`parseStage2Output`, lines 131–133):
```typescript
// Current merge (line 131-133):
const enrichedIssues: EnrichedIssue[] = validEnriched.map((item) => ({
  ...scoredIssues[item.index],
  technical_description: item.technical_description,
}))

// Modified merge — add fix_suggestion and severity_justification:
const enrichedIssues: EnrichedIssue[] = validEnriched.map((item) => ({
  ...scoredIssues[item.index],
  technical_description: item.technical_description,
  fix_suggestion: item.fix_suggestion,
  severity_justification: item.severity_justification,
}))
```

**LLM call — increase max_tokens** (line 175):
```typescript
// Change from 2048 to 4096 to accommodate two extra fields per issue:
max_tokens: 4096,
```

**System prompt — add rules block** (inside `SYSTEM_PROMPT` constant, after point 5):
```typescript
// Add after the existing "5. Cap causal edges at 5 total." rule:

RULES FOR fix_suggestion:
- Write a specific, imperative action: "Add loading=lazy to all <img> elements below the fold"
- NOT advisory: never write "Consider..." or "You might want to..."
- Reference the specific DOM element, CSS property, or metric involved
- If the fix is a code change, name the specific attribute, property, or technique

RULES FOR severity_justification:
- Estimate concrete user impact: bounce rate, task completion, conversion
- Use evidence-based framing: "Pages with LCP > 4s see 24% higher bounce rate (Google CrUX research)"
- Connect the metric to a user action: "Users waiting 3+ seconds before seeing content are 3x more likely to abandon"
- Do not just restate the threshold — explain the felt consequence
```

---

### `crawler/src/pipeline/stage3-narrator.ts` (MODIFIED — add params to signature + prompt)

**Analog:** self

Two targeted changes: (1) extend `runStage3Narration` signature with `pageType` and `benchmarkContext`, (2) inject them into the system prompt. `parseNarrativeOutput` is unchanged.

**Existing signature** (line 67–71):
```typescript
export async function runStage3Narration(
  client: Groq,
  enrichedIssues: EnrichedIssue[],
  edges: CausalEdgeCandidate[],
): Promise<NarrativeResult> {
```

**Modified signature — add two params after `edges`:**
```typescript
import type { PageType } from './page-type-detector'

export async function runStage3Narration(
  client: Groq,
  enrichedIssues: EnrichedIssue[],
  edges: CausalEdgeCandidate[],
  pageType: PageType,        // AI-03 — detected page type for narrative framing
  benchmarkContext: string,  // AI-04 — CWV benchmark paragraph ('' when no CWV data)
): Promise<NarrativeResult> {
```

**Existing system prompt structure** (lines 5–26) — the prompt uses `\n\n`-separated rule blocks. Add a new block after the existing `Rules:` section:
```typescript
// Add at the end of NARRATOR_SYSTEM_PROMPT, before the closing backtick:
[PAGE TYPE AND CONTEXT]
${pageType !== 'unknown' ? `This is a ${pageType}. Tailor your narrative framing, examples, and recommendations to this specific page type.` : ''}

[BENCHMARK COMPARISONS]
${benchmarkContext || '(No real-user CWV field data available for this URL — do not include benchmark comparisons.)'}

When CWV benchmark context is provided:
- Open the [TECHNICAL PERFORMANCE] section with the benchmark comparison (e.g. "Real user data shows LCP of 3.8s — 1.5× the 2.5s good threshold")
- Connect metric values to business impact relevant to the page type
```
Note: because `NARRATOR_SYSTEM_PROMPT` is a static `const` string, the `pageType`/`benchmarkContext` injections must be done dynamically inside `runStage3Narration` — build the prompt string inside the function, not at module scope.

**Existing user prompt construction** (line 74):
```typescript
const userPrompt = `Generate UX narrative:\n\nIssues:\n${JSON.stringify(enrichedIssues, null, 2)}\n\nCausal chains:\n${JSON.stringify(edges, null, 2)}`
```
This line is unchanged. The page-type + benchmark context belongs in the system prompt, not the user message.

---

### `crawler/src/pipeline/page-type-detector.ts` (NEW — utility, transform)

**Analog:** `crawler/src/pipeline/stage1-external-scorer.ts`

`stage1-external-scorer.ts` is the best pattern for a deterministic pure classifier: typed input signals, static rule/lookup constants at module top, named helper functions, exported public API with no side effects.

**Module structure pattern** (`stage1-external-scorer.ts` lines 1–7):
```typescript
// crawler/src/pipeline/stage1-external-scorer.ts
// Stage 1 external signal scorer — CWV + Lighthouse threshold rules.
// Completely separate from stage1-scorer.ts; existing scoreSignals() is untouched.

import type { ExternalSignals, AxeViolation } from '../lib/types'
import type { ScoredIssue } from './types'
```
`page-type-detector.ts` follows the same pattern: comment header, imports of only the types it consumes from `'../lib/types'`.

**Static lookup table pattern** (`stage1-external-scorer.ts` lines 24–80):
```typescript
const CWV_RULES: ExternalThresholdRule[] = [
  {
    signal_source: 'cwv.lcp_ms',
    category: 'perceived-perf',
    severity: 4,
    threshold: 4000,
    // ...
  },
  // ...
]
```
`page-type-detector.ts` has no rule array — it uses early-return if/else chains. The static pattern it borrows is the `as const` type annotation for the return union (copy from how `PERMITTED_MECHANISMS` is declared with `as const` in `types.ts`).

**Exported pure function pattern** (`stage1-external-scorer.ts` lines 166–217):
```typescript
export function scoreExternalSignals(signals: ExternalSignals): ScoredIssue[] {
  const candidates: ScoredIssue[] = []
  // ...
  return applyHighestSeverityWins(candidates)
}
```
`page-type-detector.ts` exports:
```typescript
export type PageType = 'e-commerce' | 'saas-dashboard' | 'landing-page' | 'blog' | 'unknown'

export function detectPageType(
  techProfile: TechProfile,
  domSignals: DOMSignals,
): PageType {
  // early-return if/else chain
  return 'unknown'
}
```
Same shape: exported type + exported pure function, no async, no side effects, no console output.

**`DOMSignals` / `TechProfile` field references** — use exactly as declared in `crawler/src/lib/types.ts`:
- `techProfile.payments` (line 183) — `string | null`
- `techProfile.framework` (line 171) — `string | null`
- `techProfile.analytics` (line 177) — `string[]`
- `domSignals.interactiveElementCount` (line 10)
- `domSignals.semanticScore.articleCount` (line 21)
- `domSignals.semanticScore.h2Count` (line 17)
- `domSignals.formCount` (line 27)
- `domSignals.ctaVisibility.buttonCount` (line 30)

---

### `crawler/src/pipeline/benchmark-context.ts` (NEW — utility, transform)

**Analog:** `crawler/src/pipeline/stage1-external-scorer.ts`

Same pattern as `page-type-detector.ts`: static constants at top, pure exported function, typed inputs from `../lib/types`.

**Imports pattern** (`stage1-external-scorer.ts` lines 6–7):
```typescript
import type { ExternalSignals, AxeViolation } from '../lib/types'
import type { ScoredIssue } from './types'
```
`benchmark-context.ts` imports:
```typescript
import type { CWVMetrics } from '../lib/types'
import type { PageType } from './page-type-detector'
```

**Static threshold table pattern** (`stage1-external-scorer.ts` lines 24–80 — `CWV_RULES` array):
The parallel in `benchmark-context.ts` is `CWV_THRESHOLDS` and `PAGE_TYPE_CONTEXT` as module-level `const` with `as const`. Follow the same placement: at module top after imports, before any functions.

**Null guard + early return pattern** (`stage1-external-scorer.ts` lines 166–169):
```typescript
export function scoreExternalSignals(signals: ExternalSignals): ScoredIssue[] {
  const candidates: ScoredIssue[] = []

  // CWV rules
  if (signals.cwv) {
```
`benchmark-context.ts` mirrors this with:
```typescript
export function buildBenchmarkContext(
  cwv: CWVMetrics | null,
  pageType: PageType,
): string {
  if (!cwv) return ''
  // ...
}
```

**Evidence formatting pattern** (`stage1-external-scorer.ts` lines 138–141):
```typescript
function formatEvidence(value: number, rule: ExternalThresholdRule): string {
  const op = rule.op === 'gt' ? '>' : '<'
  return `${value}${rule.unit} (threshold: ${op}${rule.threshold}${rule.unit} ${rule.label})`
}
```
`benchmark-context.ts` uses the same pattern of template-literal string building per metric, constructing lines into an array and joining with `\n`.

**`CWVMetrics` field names** — use exactly as declared in `crawler/src/lib/types.ts` lines 147–152:
- `cwv.lcp_ms` — `number | null`
- `cwv.cls_raw` — `number | null`
- `cwv.inp_ms` — `number | null`
- `cwv.origin_fallback` — `boolean`

---

### `crawler/src/pipeline/run-pipeline.ts` (MODIFIED — wire Stage 1.5 + page-type + benchmarks)

**Analog:** self

Three targeted additions to the existing orchestration body. The function signature does not change.

**Existing import block** (lines 1–12):
```typescript
import { put } from '@vercel/blob'
import { prisma } from '../lib/prisma'
import { getGroqClient } from '../lib/groq-client'
import { scoreSignals } from './stage1-scorer'
import { scoreExternalSignals, scoreAxeViolations } from './stage1-external-scorer'
import { runStage2Reasoning } from './stage2-reasoner'
import { runStage3Narration } from './stage3-narrator'
import type { CrawlPass, TechProfile, ExternalSignals } from '../lib/types'
```
Add three new imports at the bottom of this block:
```typescript
import { runVisualScanner } from './stage1-5-vision-scanner'
import { detectPageType } from './page-type-detector'
import { buildBenchmarkContext } from './benchmark-context'
```

**Stage 1 + screenshot upload block** (lines 48–57 in `runAIPipeline`):
```typescript
const scoredIssues = scoreSignals(signals.mobile, signals.desktop)
scoredIssues.push(...scoreExternalSignals(externalSignals ?? { cwv: null, lighthouse: null }))
scoredIssues.push(...scoreAxeViolations(signals.desktop.axeViolations ?? []))
console.log(`[pipeline] Job ${jobId}: ${scoredIssues.length} issues scored`)

const screenshotUrl = screenshot ? await uploadScreenshot(jobId, screenshot) : null
```
After `scoreAxeViolations` push and BEFORE `screenshotUrl` upload, insert Stage 1.5:
```typescript
// Stage 1.5: vision scanner (must run BEFORE Stage 2 so visual issues enter Stage 2 reasoning)
const client = getGroqClient()
if (screenshot) {
  const visualIssues = await runVisualScanner(client, screenshot)
  scoredIssues.push(...visualIssues)
  console.log(`[pipeline] Job ${jobId}: Stage 1.5 complete — ${visualIssues.length} visual issues`)
}
console.log(`[pipeline] Job ${jobId}: ${scoredIssues.length} total issues scored`)
```
Note: `getGroqClient()` is currently called at line 89 (just before Stage 2). Move the call up to Stage 1.5 insertion point, and remove the duplicate call before Stage 2.

**Stage 2 call** (line 90 — currently `const { enrichedIssues, edges } = await runStage2Reasoning(client, scoredIssues)`):
This line is unchanged. `client` is now available from the Stage 1.5 block above.

**Between Stage 2 and Stage 3** (lines 91–94 currently):
```typescript
// Stage 3: LLM narration — generates plain-English narrative with perceived/technical split
const narrative = await runStage3Narration(client, enrichedIssues, edges)
```
Insert page-type detection + benchmark context building between Stage 2 completion and Stage 3 call:
```typescript
// Page-type detection and benchmark context (deterministic — no LLM call)
const pageType = detectPageType(techProfile, signals.desktop.domSignals)
const benchmarkContext = buildBenchmarkContext(externalSignals?.cwv ?? null, pageType)
console.log(`[pipeline] Job ${jobId}: pageType=${pageType}`)

// Stage 3: LLM narration — enriched with page-type + benchmark context
const narrative = await runStage3Narration(client, enrichedIssues, edges, pageType, benchmarkContext)
```

**DB write — add new fields** (lines 112–120 — `issues.create` map):
```typescript
// Current:
issues: {
  create: enrichedIssues.map((issue) => ({
    category: issue.category,
    signal_source: issue.signal_source,
    severity: issue.severity,
    raw_evidence: issue.raw_evidence,
    technical_description: issue.technical_description,
  })),
},

// Modified — add two new fields:
issues: {
  create: enrichedIssues.map((issue) => ({
    category: issue.category,
    signal_source: issue.signal_source,
    severity: issue.severity,
    raw_evidence: issue.raw_evidence,
    technical_description: issue.technical_description,
    fix_suggestion: issue.fix_suggestion,
    severity_justification: issue.severity_justification,
  })),
},
```

---

### `crawler/src/pipeline/types.ts` (MODIFIED — add fields to EnrichedIssue)

**Analog:** self

**Existing `EnrichedIssue` interface** (lines 13–16):
```typescript
export interface EnrichedIssue extends ScoredIssue {
  technical_description: string  // 1-3 sentence plain-English explanation from Stage 2 LLM
}
```

**Modified interface — append two fields:**
```typescript
export interface EnrichedIssue extends ScoredIssue {
  technical_description: string   // existing — Stage 2 LLM
  fix_suggestion: string          // NEW — AI-01: specific implementation action
  severity_justification: string  // NEW — AI-02: estimated user impact in business terms
}
```
Follow the existing inline comment style (right-aligned `//` comment naming the source).

---

### `prisma/schema.prisma` (MODIFIED — add two columns to Issue)

**Analog:** `CausalEdge.mechanism` and `CausalEdge.explanation` in existing schema (lines 73–74)

Both `mechanism` and `explanation` on `CausalEdge` are non-nullable `String` fields. They are the exact pattern to follow for the two new `Issue` columns.

**Existing non-nullable String fields on `CausalEdge`** (lines 72–74):
```prisma
mechanism    String // NON-NULLABLE — schema-level enforcement (D-17); Prisma rejects any create without this field
explanation  String
```

**Existing `Issue` model** (lines 50–61):
```prisma
model Issue {
  id                    String       @id @default(cuid())
  resultId              String
  result                Result       @relation(fields: [resultId], references: [id])
  category              String
  signal_source         String
  severity              Int
  raw_evidence          String
  technical_description String
  causedBy              CausalEdge[] @relation("ToIssue")
  causes                CausalEdge[] @relation("FromIssue")
}
```

**Modified `Issue` model — add two fields before the relation fields:**
```prisma
model Issue {
  id                    String       @id @default(cuid())
  resultId              String
  result                Result       @relation(fields: [resultId], references: [id])
  category              String
  signal_source         String
  severity              Int
  raw_evidence          String
  technical_description String
  fix_suggestion        String       @default("") // AI-01 — concrete implementation action
  severity_justification String      @default("") // AI-02 — user impact justification
  causedBy              CausalEdge[] @relation("ToIssue")
  causes                CausalEdge[] @relation("FromIssue")
}
```
`@default("")` is mandatory — non-nullable columns added to an existing table require a Postgres DEFAULT to migrate against existing rows (RESEARCH.md Pitfall 7). This matches the project's prior pattern of using `explanation String` with `?? ''` at write time.

---

### `src/components/IssueCard.tsx` + `src/app/results/[jobId]/page.tsx` (MODIFIED — display new fields)

**Analog:** self — both files are their own analog.

**Existing `IssueCard` props interface** (`IssueCard.tsx` lines 11–19):
```typescript
interface IssueCardProps {
  issue: {
    id: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
  }
}
```

**Modified props interface — add two optional fields** (optional because old DB rows may have `""`):
```typescript
interface IssueCardProps {
  issue: {
    id: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string        // AI-01 — may be "" on pre-Phase-7 rows
    severity_justification?: string // AI-02 — may be "" on pre-Phase-7 rows
  }
}
```

**Existing render pattern** (`IssueCard.tsx` lines 36–48):
```tsx
<p className="text-sm text-slate-300 leading-relaxed">{issue.technical_description}</p>
<div className="mt-3 rounded-lg bg-slate-900/60 border border-slate-700/40 px-3 py-2.5 space-y-1">
  <p className="text-xs font-mono text-slate-500">
    <span className="text-slate-600 select-none">signal </span>
    <span className="text-slate-400">{issue.signal_source}</span>
  </p>
  <p className="text-xs font-mono text-slate-500">
    <span className="text-slate-600 select-none">evidence </span>
    <span className="text-slate-400">{issue.raw_evidence}</span>
  </p>
</div>
```
Add `fix_suggestion` and `severity_justification` as additional rows inside the existing evidence `div`, using the same `font-mono` row pattern — they are machine-generated labels alongside machine-generated evidence. Render only when non-empty:
```tsx
{issue.fix_suggestion && (
  <p className="text-xs font-mono text-slate-500">
    <span className="text-slate-600 select-none">fix </span>
    <span className="text-slate-400">{issue.fix_suggestion}</span>
  </p>
)}
{issue.severity_justification && (
  <p className="text-xs font-mono text-slate-500">
    <span className="text-slate-600 select-none">impact </span>
    <span className="text-slate-400">{issue.severity_justification}</span>
  </p>
)}
```

**`results/[jobId]/page.tsx` inline type annotation** (lines 181–188 — the issue map):
```typescript
// Existing inline type cast on result.issues.map:
result.issues.map((issue: {
  id: string
  category: string
  signal_source: string
  severity: number
  raw_evidence: string
  technical_description: string
}) => <IssueCard key={issue.id} issue={issue} />)
```
Add the two new fields to this inline type annotation to match the updated `IssueCardProps`:
```typescript
result.issues.map((issue: {
  id: string
  category: string
  signal_source: string
  severity: number
  raw_evidence: string
  technical_description: string
  fix_suggestion: string
  severity_justification: string
}) => <IssueCard key={issue.id} issue={issue} />)
```
`result.issues` comes from a Prisma `findUnique` — once the schema migration runs, the Prisma client type will include these fields. The inline cast is consistent with the project pattern already in use on this file.

---

## Shared Patterns

### Groq Tool-Call Discipline
**Source:** `crawler/src/pipeline/stage2-reasoner.ts` (entire file)
**Apply to:** `stage1-5-vision-scanner.ts`

All Groq LLM calls in this project use forced function calling (`tool_choice: { type: 'function', function: { name: '...' } }`), never `response_format: { type: 'json_object' }`. The tool definition is a module-level const typed as `Groq.Chat.Completions.ChatCompletionTool`. The output is validated through an exported Zod schema. The parsing logic is in a separate exported `parseXxx` pure function so tests can validate it without network calls.

### Zod `zod/v4` Import
**Source:** `crawler/src/pipeline/stage2-reasoner.ts` line 2
**Apply to:** `stage1-5-vision-scanner.ts`
```typescript
import { z } from 'zod/v4'
```
Note the `/v4` subpath — not `from 'zod'`. This is the project standard; mismatched imports cause type errors.

### `[pipeline]` Console Log Prefix
**Source:** `run-pipeline.ts` lines 54, 84, 91, 95, 143; `stage2-reasoner.ts` lines 165, 184; `stage3-narrator.ts` lines 71, 86
**Apply to:** All new pipeline files
```typescript
console.log(`[pipeline] Stage X: ...`)
console.warn('[pipeline] Stage 1.5 vision scan failed:', ...)
```
All pipeline logs use the `[pipeline]` prefix for easy log filtering. Use `console.warn` for non-fatal degraded-mode conditions; `console.log` for normal progress checkpoints.

### Non-Nullable String DB Column with `@default("")`
**Source:** `prisma/schema.prisma` `CausalEdge.explanation` (line 74) + RESEARCH.md Pitfall 7
**Apply to:** `fix_suggestion` and `severity_justification` columns on `Issue`

Non-nullable `String` columns on existing tables require `@default("")` for Postgres migration compatibility. The application layer always writes the real value; `""` is only a migration sentinel.

### Pure Deterministic Function File Structure
**Source:** `crawler/src/pipeline/stage1-external-scorer.ts` (entire file)
**Apply to:** `page-type-detector.ts`, `benchmark-context.ts`

Pattern: comment header → imports (types only) → static rule/table constants → private helper functions → exported public functions. No side effects, no async, no console output. File is self-contained: all constants it needs are declared inline or come from typed imports.

---

## No Analog Found

All files have close analogs in the existing codebase. No entries in this section.

---

## Test File Pattern Assignments

### `crawler/src/pipeline/stage1-5-vision-scanner.test.ts` (NEW)

**Analog:** `crawler/src/pipeline/stage2-reasoner.test.ts`

**Test file header pattern** (`stage2-reasoner.test.ts` lines 1–3):
```typescript
// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { Stage2OutputSchema, parseStage2Output } from './stage2-reasoner'
```
Stage 1.5 test file:
```typescript
// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'
import { VisualIssuesSchema, parseVisualIssues, runVisualScanner } from './stage1-5-vision-scanner'
```

**Fixture pattern** (`stage2-reasoner.test.ts` lines 7–22):
```typescript
const TWO_ISSUES: ScoredIssue[] = [ /* ... */ ]
```
Stage 1.5 uses raw tool-call output fixture (no `ScoredIssue[]` input needed):
```typescript
const VALID_TOOL_OUTPUT = {
  visual_issues: [
    { description: '...', location: 'hero section', severity: 3, visual_category: 'contrast' },
    // ...
  ],
}
```

**Schema validation test pattern** (`stage2-reasoner.test.ts` lines 24–99):
```typescript
describe('Stage2OutputSchema', () => {
  it('passes for valid input ...', () => {
    expect(() => Stage2OutputSchema.parse(valid)).not.toThrow()
  })
  it('fails parse when ...', () => {
    expect(() => Stage2OutputSchema.parse(invalid)).toThrow()
  })
})
```

**`runVisualScanner` error/null tests** — use `vi.fn()` mock for Groq client (same approach as stage2-reasoner test uses — it tests `parseStage2Output` directly and does not mock Groq for unit tests; for `runVisualScanner` error handling, pass a mock client):
```typescript
it('returns [] when screenshot buffer exceeds 2.5MB', async () => {
  const largeBuffer = Buffer.alloc(2_600_000)
  const mockClient = {} as Groq
  const result = await runVisualScanner(mockClient, largeBuffer)
  expect(result).toEqual([])
})
```

### `crawler/src/pipeline/page-type-detector.test.ts` (NEW)
### `crawler/src/pipeline/benchmark-context.test.ts` (NEW)

**Analog:** `crawler/src/pipeline/stage1-external-scorer.test.ts`

**Test file structure** (`stage1-external-scorer.test.ts` lines 1–9):
```typescript
/**
 * crawler/src/pipeline/stage1-external-scorer.test.ts
 * Unit tests for CWV + Lighthouse threshold scoring.
 * Pure unit tests — no fetch mocks needed.
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest'
import { scoreExternalSignals, scoreAxeViolations } from './stage1-external-scorer'
import type { ExternalSignals } from '../lib/types'
```

**Helper factory function pattern** (`stage1-external-scorer.test.ts` lines 15–21):
```typescript
function makeSignals(overrides: Partial<ExternalSignals> = {}): ExternalSignals {
  return {
    cwv: null,
    lighthouse: null,
    ...overrides,
  }
}
```
For `page-type-detector.test.ts`, create `makeTechProfile` and `makeDOMSignals` factory helpers. For `benchmark-context.test.ts`, create `makeCWV` factory helper. Follow the same `overrides: Partial<T> = {}` pattern for easy per-test customization.

---

## Metadata

**Analog search scope:** `crawler/src/pipeline/`, `src/components/`, `src/app/results/`, `prisma/schema.prisma`
**Files scanned:** 11 pipeline files, 13 component files, 2 page files, 1 Prisma schema
**Pattern extraction date:** 2026-05-27
