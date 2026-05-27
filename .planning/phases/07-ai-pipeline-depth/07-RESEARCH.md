# Phase 7: AI Pipeline Depth — Research

**Researched:** 2026-05-27
**Domain:** Groq vision API, structured LLM output design, page-type classification, CWV benchmark comparisons, per-issue actionable enrichment
**Confidence:** HIGH for vision API integration; HIGH for prompt-engineering architecture; MEDIUM for benchmark data (no official per-industry median exists)

---

## Summary

Phase 7 extends the existing 3-stage AI pipeline in five directions: (1) visual screenshot analysis via a Groq vision model (SIGNAL-04), (2) per-issue actionable fix suggestions in Stage 2 output (AI-01), (3) per-issue severity justification with user-impact framing (AI-02), (4) page-type detection and context-aware narrative in Stage 3 (AI-03), and (5) CWV benchmark comparisons in Stage 3 narrative (AI-04).

The core architectural pattern is incremental enrichment of the existing pipeline. Stage 2 already emits a `technical_description` per issue; Phase 7 adds `fix_suggestion` and `severity_justification` as additional fields on the same tool call. Stage 3 already emits a narrative; Phase 7 enriches its input context with page-type and benchmark data so it frames the narrative differently. The screenshot analysis runs as a new standalone LLM call — call it Stage 1.5 — that produces visual issues in the same `ScoredIssue` shape as Stage 1, so no downstream changes to Stage 2 or Stage 3 are needed.

The screenshot is already captured by `browser.ts` (desktop pass) and already uploaded to Vercel Blob in `run-pipeline.ts`. For Stage 1.5, it needs to be fed to `meta-llama/llama-4-scout-17b-16e-instruct` as a base64-encoded JPEG. The Groq vision model supports tool use (forced function calling) with image inputs, so Stage 1.5 can share the same structured-output discipline as Stages 2 and 3.

**Primary recommendation:** Implement Phase 7 as three plans: (1) Stage 1.5 visual scanner (SIGNAL-04), (2) Stage 2 enrichment fields (AI-01 + AI-02), (3) Stage 3 page-type + benchmark context (AI-03 + AI-04). Each plan touches one pipeline stage and produces independently testable outputs.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SIGNAL-04 | System feeds page screenshot to a vision model to surface visual, layout, and contrast issues not detectable via DOM parsing | Groq `meta-llama/llama-4-scout-17b-16e-instruct` supports base64 image input + tool use; screenshot already captured by `browser.ts` as JPEG buffer |
| AI-01 | Each issue includes a concrete actionable fix suggestion (specific implementation action, not advisory framing) | Stage 2 tool call extended with `fix_suggestion` field; Zod schema extended; prompt updated with fix-framing rules |
| AI-02 | Each issue includes a severity justification that estimates user impact (e.g. bounce rate correlation, task abandonment risk) | Stage 2 tool call extended with `severity_justification` field; user-impact language distinct from `technical_description` |
| AI-03 | System detects page type (e-commerce, landing page, SaaS dashboard, blog, etc.) and tailors issue framing and narrative to that context | Page-type detection via deterministic heuristics from existing `TechProfile` + DOM signals; injected as context into Stage 3 prompt |
| AI-04 | System compares crawled metrics against industry baseline benchmarks (e.g. "your LCP is 2× the median for e-commerce") | Static benchmark table (Google-published thresholds + Web Almanac aggregate data) injected into Stage 3 prompt when CWV data available |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Screenshot → visual issue list (SIGNAL-04) | Crawler (Stage 1.5) | — | Screenshot buffer already lives in crawler memory; Groq vision call belongs here to keep it in the same synchronous pipeline chain |
| Actionable fix suggestion per issue (AI-01) | Crawler Stage 2 LLM | — | Fix suggestions are issue-level; Stage 2 already processes each issue individually |
| Severity justification per issue (AI-02) | Crawler Stage 2 LLM | — | Same unit of work as AI-01 — co-located in Stage 2 tool call to save one LLM round-trip |
| Page-type detection (AI-03) | Crawler (deterministic pre-Stage 3) | — | Detection uses `TechProfile` + `DOMSignals` already in memory; no LLM needed for classification |
| Context-aware narrative framing (AI-03) | Crawler Stage 3 LLM | — | Page-type label is injected into Stage 3 system prompt; LLM does the framing |
| CWV benchmark comparisons (AI-04) | Crawler Stage 3 LLM | — | Benchmark table is static; injected into Stage 3 prompt alongside CWV values from `tech_stack._signals` |
| Schema extension (fix_suggestion, severity_justification) | Prisma schema | Next.js app | Issue model gains two new non-nullable text columns |
| Display of new fields | Next.js app (dashboard) | — | UI renders fix_suggestion and severity_justification per issue card |

---

## Standard Stack

### Core (all already installed — no new packages required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `groq-sdk` | 1.2.0 [VERIFIED: npm registry] | Groq API client — used for existing Stages 2 & 3; Stage 1.5 vision call uses same client | Already in `crawler/package.json`; supports multimodal messages via standard OpenAI-compatible API |
| `zod` | 4.4.3 [VERIFIED: npm registry] | Schema validation — already used in Stage 2; Stage 1.5 + extended Stage 2 schema follow same pattern | Already in `crawler/package.json`; project-standard for LLM output validation |

### No New Packages Required

Phase 7 introduces no new npm dependencies. The vision call uses `groq-sdk` which is already installed. Benchmark data is a static compile-time constant. Page-type detection is pure TypeScript logic over existing signal types.

**Installation:** No `sfw npm install` commands required for this phase.

---

## Package Legitimacy Audit

> Phase 7 installs no new packages. All required libraries are already in `crawler/package.json`.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `groq-sdk` | npm | ~1.3 yrs (2024-02-16) | High (Groq official SDK) | github.com/groq/groq-node | [OK] | Approved — already installed |
| `zod` | npm | Established | Very high | github.com/colinhacks/zod | [OK] | Approved — already installed |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

*slopcheck 0.6.1 was available and ran successfully. Both packages returned [OK]. No postinstall scripts found for `groq-sdk` (`npm view groq-sdk scripts.postinstall` → empty).*

---

## Architecture Patterns

### System Architecture Diagram

```
Screenshot (Buffer, JPEG)
         │
         ▼
  [Stage 1.5: Vision Scanner]
  meta-llama/llama-4-scout-17b-16e-instruct
  base64 image + structured tool call
         │
         ▼
  VisualIssue[] (same ScoredIssue shape)
         │
         ├──────────────────────┐
         │                      │
  Existing ScoredIssue[]   (concatenated)
  (Stage 1 + external scorer)
         │
         ▼
  [Stage 2: LLM Reasoning — EXTENDED]
  llama-3.3-70b-versatile
  Input: ScoredIssue[] (all types)
  Output: EnrichedIssue[] WITH:
    + technical_description  (existing)
    + fix_suggestion          (AI-01)
    + severity_justification  (AI-02)
  + CausalEdge[]
         │
         ▼
  [Page-Type Detection — DETERMINISTIC]
  detectPageType(techProfile, domSignals)
  Returns: 'e-commerce' | 'saas-dashboard' |
           'landing-page' | 'blog' | 'unknown'
         │
         ▼
  [Benchmark Context Builder]
  buildBenchmarkContext(cwvSignals, pageType)
  Returns: string paragraph (or '' if no CWV)
         │
         ▼
  [Stage 3: LLM Narration — ENRICHED INPUT]
  llama-3.3-70b-versatile
  Input: enrichedIssues + edges +
         pageType + benchmarkContext
  Output: NarrativeResult (same shape)
  (narrative now starts with page-type framing,
   includes benchmark comparisons when CWV available)
         │
         ▼
  Prisma DB write
  Result + Issue (with fix_suggestion, severity_justification)
  + CausalEdge
```

### Recommended Project Structure (changes only)

```
crawler/src/
├── pipeline/
│   ├── stage1-5-vision-scanner.ts   # NEW: Stage 1.5 vision LLM call
│   ├── stage1-5-vision-scanner.test.ts  # NEW: unit tests for parse/schema
│   ├── stage2-reasoner.ts           # MODIFIED: add fix_suggestion + severity_justification fields
│   ├── stage2-reasoner.test.ts      # MODIFIED: extended schema tests
│   ├── stage3-narrator.ts           # MODIFIED: inject pageType + benchmarkContext
│   ├── stage3-narrator.test.ts      # MODIFIED: page-type framing tests
│   ├── page-type-detector.ts        # NEW: deterministic page-type heuristics
│   ├── page-type-detector.test.ts   # NEW: heuristic tests
│   ├── benchmark-context.ts         # NEW: benchmark table + context builder
│   ├── benchmark-context.test.ts    # NEW: benchmark comparison formatting tests
│   ├── run-pipeline.ts              # MODIFIED: wire Stage 1.5, pass pageType + benchmark to Stage 3
│   └── types.ts                     # MODIFIED: add fix_suggestion + severity_justification to EnrichedIssue
prisma/
└── schema.prisma                    # MODIFIED: add fix_suggestion + severity_justification to Issue
src/
└── (Next.js app — display new fields in issue cards)
```

### Pattern 1: Stage 1.5 — Vision Scanner (SIGNAL-04)

**What:** Call `meta-llama/llama-4-scout-17b-16e-instruct` with the JPEG screenshot as base64 + a forced tool call. Output is a `VisualIssue[]` that is immediately converted to `ScoredIssue[]` using the same shape as Stage 1.

**When to use:** Always when `screenshot` is non-null (screenshot capture can fail — see pitfalls). Returns `[]` on null or failure.

**Key design decision:** Stage 1.5 runs AFTER `runDualViewportCrawl` but BEFORE Stage 2. It inserts visual issues into the `scoredIssues` array so Stage 2 reasons about them naturally alongside DOM/network/axe issues.

```typescript
// Source: Groq vision docs (console.groq.com/docs/vision) + groq-sdk OpenAI-compat message format
// crawler/src/pipeline/stage1-5-vision-scanner.ts

import Groq from 'groq-sdk'
import { z } from 'zod/v4'
import type { ScoredIssue } from './types'

const VISION_SYSTEM_PROMPT = `You are a visual UX analyst. You receive a full-page screenshot of a website and identify visual, layout, and contrast issues that are NOT detectable through DOM analysis.

Focus ONLY on issues visible in the screenshot:
- Color contrast failures (text on background that looks hard to read)
- Crowded or cluttered layout sections
- Inconsistent visual hierarchy (headings/subheadings not clearly differentiated by size/weight)
- Above-the-fold content failures (key CTA or value proposition not immediately visible)
- Broken or misaligned layout sections
- Missing visual breathing room (padding/spacing problems)

Do NOT repeat issues already detectable via DOM/ARIA (e.g. missing alt attributes, missing form labels).
Do NOT invent issues — only report what is visually apparent in the screenshot.
Cap output at 5 issues maximum.`

const EMIT_VISUAL_ISSUES_TOOL: Groq.Chat.Completions.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'emit_visual_issues',
    description: 'Emit a list of visual UX issues found in the screenshot.',
    parameters: {
      type: 'object',
      properties: {
        visual_issues: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string', description: 'What the visual problem is (1-2 sentences)' },
              location: { type: 'string', description: 'Where on the page (e.g. "top navigation", "hero section", "form area")' },
              severity: { type: 'number', description: '1=Low, 2=Medium, 3=High, 4=Critical' },
              visual_category: {
                type: 'string',
                enum: ['contrast', 'layout', 'hierarchy', 'cta-visibility', 'spacing', 'other'],
              },
            },
            required: ['description', 'location', 'severity', 'visual_category'],
          },
        },
      },
      required: ['visual_issues'],
    },
  },
}

export const VisualIssuesSchema = z.object({
  visual_issues: z.array(z.object({
    description: z.string().min(1).max(300),
    location: z.string().min(1).max(100),
    severity: z.number().int().min(1).max(4),
    visual_category: z.enum(['contrast', 'layout', 'hierarchy', 'cta-visibility', 'spacing', 'other']),
  })).max(5),
})

export function parseVisualIssues(raw: Record<string, unknown>): ScoredIssue[] {
  const parsed = VisualIssuesSchema.parse(raw)
  return parsed.visual_issues.map((issue) => ({
    category: 'perceived-perf' as const,
    signal_source: `visual.${issue.visual_category}`,
    severity: issue.severity as 1 | 2 | 3 | 4,
    raw_evidence: `${issue.description} (location: ${issue.location})`,
    viewport: 'desktop' as const,
  }))
}

export async function runVisualScanner(
  client: Groq,
  screenshotBuffer: Buffer,
): Promise<ScoredIssue[]> {
  const base64Image = screenshotBuffer.toString('base64')

  try {
    const response = await client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        { role: 'system', content: VISION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this screenshot for visual UX issues.' },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
      tools: [EMIT_VISUAL_ISSUES_TOOL],
      tool_choice: { type: 'function', function: { name: 'emit_visual_issues' } },
      max_tokens: 1024,
    })

    const toolCall = response.choices[0]?.message?.tool_calls?.[0]
    if (!toolCall || toolCall.type !== 'function') {
      console.warn('[pipeline] Stage 1.5: no tool call returned — treating as 0 visual issues')
      return []
    }
    const raw = JSON.parse(toolCall.function.arguments) as Record<string, unknown>
    return parseVisualIssues(raw)
  } catch (err) {
    console.warn('[pipeline] Stage 1.5 vision scan failed:', err instanceof Error ? err.message : err)
    return []  // non-blocking — job continues without visual issues
  }
}
```

[CITED: console.groq.com/docs/vision — base64 format `data:image/jpeg;base64,...`, 4MB limit for base64]
[CITED: console.groq.com/docs/model/meta-llama/llama-4-scout-17b-16e-instruct — model ID, tool use support, 8192 max output tokens]

### Pattern 2: Stage 2 Extended Output (AI-01 + AI-02)

**What:** Add `fix_suggestion` and `severity_justification` fields to the existing Stage 2 tool definition and Zod schema. Both fields are required in the tool output alongside the existing `technical_description`.

**Key constraint:** The `technical_description` must stay exactly as-is (existing field, existing DB column). The two new fields go into two new DB columns on `Issue`.

```typescript
// Modified EMIT_ANALYSIS_TOOL — add to existing properties in stage2-reasoner.ts
// Source: existing stage2-reasoner.ts pattern

// Add inside items.properties of enriched_issues:
fix_suggestion: {
  type: 'string',
  description: 'Specific implementation action to fix this issue (e.g. "Add loading=lazy to all below-fold <img> elements", NOT "Consider optimizing images")'
},
severity_justification: {
  type: 'string',
  description: 'Estimated user impact in business terms (e.g. "Users on mobile connections will see a blank screen for 3+ seconds during LCP, increasing bounce rate by an estimated 20-30%")'
},

// Add to existing required array:
required: ['index', 'technical_description', 'fix_suggestion', 'severity_justification']
```

```typescript
// Modified Stage2OutputSchema — add to enriched_issues z.object():
fix_suggestion: z.string().min(1).max(300),
severity_justification: z.string().min(1).max(300),
```

```typescript
// Modified EnrichedIssue interface in pipeline/types.ts:
export interface EnrichedIssue extends ScoredIssue {
  technical_description: string   // existing — Stage 2 LLM
  fix_suggestion: string          // NEW — AI-01
  severity_justification: string  // NEW — AI-02
}
```

**Prisma schema change required:** Add two new columns to `Issue`:

```prisma
model Issue {
  // ... existing fields ...
  fix_suggestion        String  // AI-01 — concrete implementation action
  severity_justification String  // AI-02 — user impact justification
}
```

**Migration strategy:** New non-nullable columns require a migration with a default value. Use `@default("")` as the migration default, then the application always sets the field from Stage 2. Existing rows from before this phase will have empty strings — acceptable since they predate the feature.

**Stage 2 system prompt additions:**

```
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

### Pattern 3: Page-Type Detection (AI-03)

**What:** Deterministic classifier using existing `TechProfile` and `DOMSignals` data already available in memory when `runAIPipeline` is called.

**Rationale:** An LLM call for page-type detection would add ~1-2s to the pipeline and introduce hallucination risk for something that is reliably detectable from signals. Deterministic heuristics are faster, cheaper, and more reliable for this use case. [ASSUMED — design choice, valid alternative is vision-model classification from screenshot]

```typescript
// crawler/src/pipeline/page-type-detector.ts

export type PageType = 'e-commerce' | 'saas-dashboard' | 'landing-page' | 'blog' | 'unknown'

import type { TechProfile } from '../lib/types'
import type { DOMSignals } from '../lib/types'

export function detectPageType(
  techProfile: TechProfile,
  domSignals: DOMSignals,
): PageType {
  const { payments, framework, analytics } = techProfile

  // E-commerce signal: payment integration detected
  if (payments) return 'e-commerce'

  // SaaS dashboard: authenticated app-like structure
  // Heuristic: many interactive elements, no analytics pixel, likely Next.js/React
  if (
    domSignals.interactiveElementCount > 20 &&
    analytics.length === 0 &&
    (framework === 'Next.js' || framework === 'React')
  ) return 'saas-dashboard'

  // Blog: many article/semantic elements, few interactive elements, no payments
  if (
    domSignals.semanticScore.articleCount > 2 ||
    (domSignals.semanticScore.h2Count > 5 && domSignals.interactiveElementCount < 5)
  ) return 'blog'

  // Landing page: few form fields but CTAs present, marketing stack
  if (
    domSignals.formCount < 2 &&
    domSignals.ctaVisibility.buttonCount > 0 &&
    analytics.length > 0
  ) return 'landing-page'

  return 'unknown'
}
```

**Page-type to narrative framing map** (injected into Stage 3 system prompt):

| Page Type | Framing Focus |
|-----------|--------------|
| `e-commerce` | Conversion rate, checkout abandonment, product page trust signals |
| `saas-dashboard` | Task completion, INP/interactivity, dashboard responsiveness |
| `landing-page` | Time-to-value, above-the-fold clarity, form conversion |
| `blog` | Reading experience, content discovery, mobile readability |
| `unknown` | Generic UX framing (current behavior) |

### Pattern 4: Benchmark Context Builder (AI-04)

**What:** Static lookup table of CWV thresholds + Web Almanac aggregate data, formatted as a human-readable paragraph when CWV data is available. Injected as additional context into Stage 3.

**Key constraint:** No external API call — benchmarks are compile-time constants. The PSI API already provides the site's p75 CWV values; Phase 7 only needs to compare them against known thresholds.

```typescript
// crawler/src/pipeline/benchmark-context.ts

import type { CWVMetrics } from '../lib/types'
import type { PageType } from './page-type-detector'

// Source: web.dev/articles/vitals (official Google thresholds)
// Source: 2025 Web Almanac (almanac.httparchive.org/en/2025/performance) — aggregate mobile pass rates
const CWV_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },    // ms
  cls: { good: 10,   poor: 25 },      // raw integer (PSI percentile × 100)
  inp: { good: 200,  poor: 500 },     // ms
} as const

// Web-wide median benchmarks from 2025 Web Almanac:
// Mobile good-LCP pass rate: 62%; median LCP for failing pages: ~4-6s [ASSUMED — Almanac does not publish median by page type]
// Industry-specific medians are not officially published by Google or HTTP Archive by vertical [ASSUMED]
// Using threshold-relative framing avoids the lack of authoritative per-vertical median data
const PAGE_TYPE_CONTEXT: Record<string, string> = {
  'e-commerce': 'E-commerce pages. Slow LCP directly correlates with cart abandonment — every 100ms above 2.5s LCP reduces conversion by ~1-2%.',
  'saas-dashboard': 'SaaS dashboard. INP is the critical metric — users interacting with filters, tables, and controls need sub-200ms responses to feel in control.',
  'landing-page': 'Marketing landing page. LCP determines first impression — pages that load their hero in under 2.5s convert at 15-30% higher rates.',
  'blog': 'Blog or editorial page. CLS is critical — layout shifts while reading are highly frustrating and damage trust.',
  'unknown': 'Web page.',
}

export function buildBenchmarkContext(
  cwv: CWVMetrics | null,
  pageType: PageType,
): string {
  if (!cwv) return ''

  const lines: string[] = []
  const context = PAGE_TYPE_CONTEXT[pageType] ?? PAGE_TYPE_CONTEXT['unknown']
  lines.push(`Context: This is a ${context}`)
  lines.push('')
  lines.push('Real-user performance benchmarks (from CrUX field data):')

  if (cwv.lcp_ms !== null) {
    const lcpS = (cwv.lcp_ms / 1000).toFixed(2)
    const ratio = (cwv.lcp_ms / CWV_THRESHOLDS.lcp.good).toFixed(1)
    const status = cwv.lcp_ms <= CWV_THRESHOLDS.lcp.good ? 'GOOD' :
                   cwv.lcp_ms <= CWV_THRESHOLDS.lcp.poor ? 'NEEDS IMPROVEMENT' : 'POOR'
    lines.push(`- LCP: ${lcpS}s (${status}) — the "good" threshold is 2.5s; this page is ${ratio}× the good threshold`)
  }

  if (cwv.cls_raw !== null) {
    const clsFloat = (cwv.cls_raw / 100).toFixed(2)
    const status = cwv.cls_raw <= CWV_THRESHOLDS.cls.good ? 'GOOD' :
                   cwv.cls_raw <= CWV_THRESHOLDS.cls.poor ? 'NEEDS IMPROVEMENT' : 'POOR'
    lines.push(`- CLS: ${clsFloat} (${status}) — the "good" threshold is 0.1`)
  }

  if (cwv.inp_ms !== null) {
    const ratio = (cwv.inp_ms / CWV_THRESHOLDS.inp.good).toFixed(1)
    const status = cwv.inp_ms <= CWV_THRESHOLDS.inp.good ? 'GOOD' :
                   cwv.inp_ms <= CWV_THRESHOLDS.inp.poor ? 'NEEDS IMPROVEMENT' : 'POOR'
    lines.push(`- INP: ${cwv.inp_ms}ms (${status}) — the "good" threshold is 200ms; this page is ${ratio}× the good threshold`)
  }

  if (cwv.origin_fallback) {
    lines.push('(Note: these are origin-level metrics, not URL-specific)')
  }

  return lines.join('\n')
}
```

[CITED: web.dev/articles/vitals — LCP 2.5s good/4s poor, INP 200ms good/500ms poor, CLS 0.1 good/0.25 poor]
[CITED: almanac.httparchive.org/en/2025/performance — overall mobile good-LCP rate 62%, good-INP rate 77%]

### Anti-Patterns to Avoid

- **Running Stage 1.5 as a sequential extra LLM call after Stage 2:** Visual scanner results must be concatenated with Stage 1 issues BEFORE Stage 2, so Stage 2 can reason about visual issues and form causal edges with them. Don't add it as a parallel Stage 2b call.
- **Adding page-type detection as an LLM call:** Deterministic heuristics are cheaper, faster, and just as accurate for structured signal data. The LLM does not need to see the HTML to classify page type.
- **Injecting raw benchmark numbers into Stage 2:** Benchmarks belong in Stage 3 (narrative context). Stage 2 reasons about individual issues, not cross-metric comparisons.
- **Making fix_suggestion and severity_justification nullable in the DB schema:** Both fields must be non-nullable with `@default("")` migration default, matching the project pattern for non-nullable AI fields (see `mechanism`, `explanation` in `CausalEdge`).
- **Converting screenshot to PNG before sending to Groq:** JPEG is already captured and is much smaller. JPEG quality 82 means typical desktop screenshots are 50-200KB, well within the 4MB base64 limit.
- **Using `response_format: { type: 'json_object' }` for Stage 1.5:** Use forced tool calling (`tool_choice`) like Stages 2 and 3 — it is more reliable than JSON mode for structured outputs and is already the established project pattern.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Per-industry LCP median lookup | Custom CrUX BigQuery pipeline | Static threshold table based on official Google thresholds | No authoritative per-industry median is publicly published in machine-readable form; threshold-relative framing ("2× the good threshold") is more robust and honest than made-up "industry medians" |
| Image resizing before Groq upload | Custom sharp/canvas resize pipeline | Send JPEG at captured quality (82) directly | Desktop screenshots at 1440×900 JPEG q82 are ~100-200KB — well under the 4MB base64 limit; no resize needed |
| Custom vision model inference | Self-hosted vision model | `meta-llama/llama-4-scout-17b-16e-instruct` via Groq | Already using Groq; no new billing relationship; same SDK and auth |
| Page-type classification via LLM | Vision or text LLM call | Deterministic heuristics from `TechProfile` + `DOMSignals` | Signals are already present in memory; LLM adds latency and cost for no accuracy gain |
| Custom structured output parsing | Hand-written JSON parser | Zod schema (already project standard) | Zod handles edge cases (extra fields, type coercions, max-length enforcement) reliably |

**Key insight:** The project already has a disciplined structured-output pipeline. Phase 7 extends it in-kind — same tool-call pattern, same Zod validation, same `parseXxx` function shape. Resist the temptation to use free-text responses for Stage 1.5 instead of tool calling.

---

## Common Pitfalls

### Pitfall 1: Stage 1.5 Screenshot Base64 Size Exceeds Groq 4MB Limit
**What goes wrong:** `screenshotBuffer.toString('base64')` for a large full-page screenshot (height > 3000px due to `fullPage: false` being bypassed, or JPEG quality set too high) produces a base64 string > 4MB. Groq returns 400.
**Why it happens:** `browser.ts` captures `fullPage: false` at JPEG quality 82. A 1440×900 JPEG at q82 is typically 80-200KB. However, content-heavy pages can push this higher.
**How to avoid:** Assert buffer size in `runVisualScanner` before encoding: if `screenshotBuffer.length > 2_500_000` (2.5MB pre-base64 which becomes ~3.3MB after encoding), log a warning and return `[]`. Base64 encoding adds ~33% overhead; 3MB JPEG → ~4MB base64. The 2.5MB pre-encode check provides a safe margin.
**Warning signs:** `[pipeline] Stage 1.5 vision scan failed: 400` in Railway logs.

### Pitfall 2: Vision Model Returns Hallucinated Issues
**What goes wrong:** The model invents issues not visible in the screenshot (e.g. "navigation links are broken" when they are working). This is a known failure mode of vision models on UI screenshots.
**Why it happens:** Vision models have a tendency to extrapolate from partial visual information, especially around interactive states they cannot observe.
**How to avoid:** System prompt explicitly says "Do NOT invent issues" and "only report what is visually apparent in the screenshot." Cap at 5 issues to limit hallucination surface. No fix for this is 100% reliable — treat visual issues as "low-confidence signals" that Stage 2 can reason about but not over-weight.
**Warning signs:** Visual issues referencing invisible/impossible states (broken links, missing images) when the rest of the analysis shows a working page.

### Pitfall 3: Stage 2 Token Budget Exceeded with New Fields
**What goes wrong:** Adding `fix_suggestion` and `severity_justification` to each enriched issue roughly doubles the Stage 2 output token count. With 20+ issues, the 2048 `max_tokens` limit may be hit, causing a truncated or missing tool call.
**Why it happens:** Each new field adds ~50-100 tokens per issue. At 20 issues: 20 × 200 tokens = 4000 extra tokens potentially needed.
**How to avoid:** Increase Stage 2 `max_tokens` from 2048 to 4096. Also cap `fix_suggestion` and `severity_justification` at 300 characters each in the Zod schema (shorter than `technical_description` max of 500 chars) to keep per-issue token cost bounded. [ASSUMED — 4096 is within Groq's model limits for llama-3.3-70b-versatile; verify against model context window]
**Warning signs:** `Stage 2: expected tool call not returned by model` error when there are many issues.

### Pitfall 4: Groq Vision Model Rate Limit (1,000 RPD)
**What goes wrong:** `meta-llama/llama-4-scout-17b-16e-instruct` has 1,000 requests/day on the free tier vs 14,400 RPD for `llama-3.3-70b-versatile`. With 3 LLM calls per job (Stage 1.5 + Stage 2 + Stage 3), the daily job capacity drops to 333 jobs/day before the vision model becomes the bottleneck.
**Why it happens:** Vision model has stricter rate limits than text models on the free tier. [CITED: console.groq.com/docs/rate-limits — llama-4-scout: 1K RPD, llama-3.3-70b: 1K RPD on free tier]
**How to avoid:** The 1,000 RPD limit applies per day per model. Since both models share 1K RPD, the bottleneck is actually 333 jobs/day (3 LLM calls each). For an MVP, this is acceptable. If load increases, Stage 1.5 can be made conditional (only run when screenshot size < threshold AND job queue depth is low). For production, upgrade to Groq Developer plan.
**Warning signs:** 429 errors on Stage 1.5 calls during peak usage.

### Pitfall 5: `fix_suggestion` Regresses to Advisory Language
**What goes wrong:** The LLM generates `fix_suggestion` values like "Consider lazy-loading images" or "You might want to reduce the number of render-blocking scripts" despite the prompt saying to use imperative framing.
**Why it happens:** LLMs trained on helpful assistant data default to suggestion framing. Explicit prompt rules help but do not guarantee compliance.
**How to avoid:** Add a Zod `.refine()` check that rejects `fix_suggestion` values starting with "Consider", "You might", "You could", "Try to", or "It is recommended". If the refine fails, log a warning and use the `technical_description` value as a fallback — do not fail the entire job over a framing issue.
**Warning signs:** Large fraction of `fix_suggestion` values starting with soft language in logs.

### Pitfall 6: Page-Type Detector Always Returns 'unknown'
**What goes wrong:** The deterministic heuristics return `'unknown'` for the majority of pages because the signal thresholds are too strict or `techProfile` fields are frequently null.
**Why it happens:** `techProfile.payments` is only set when `hasPaddle`, `hasStripe`, or similar fingerprints are detected. Many e-commerce sites use custom payment flows not fingerprinted by the tech detector.
**How to avoid:** `'unknown'` falls back gracefully to generic narrative framing (current behavior). The page-type detection is a best-effort enhancement, not a requirement for correct output. Log the detected type per job so the distribution can be monitored and heuristics tuned.
**Warning signs:** 90%+ of analyses have `pageType='unknown'` in logs.

### Pitfall 7: Prisma Migration Non-Nullable Column on Existing Table
**What goes wrong:** Running `db:migrate` with two new non-nullable `String` columns on a table that has existing rows fails because PostgreSQL cannot add a non-nullable column without a default.
**Why it happens:** Prisma generates `ALTER TABLE "Issue" ADD COLUMN "fix_suggestion" TEXT NOT NULL` which Postgres rejects if rows exist.
**How to avoid:** Use `@default("")` in the Prisma schema for both new fields. The migration will use `DEFAULT ''` which satisfies Postgres. Remove the `@default("")` annotation only if the project chooses to enforce non-empty at the application layer after migration.
**Warning signs:** Migration fails with `column "fix_suggestion" of relation "Issue" contains null values`.

---

## Code Examples

### Stage 1.5 Integration into run-pipeline.ts

```typescript
// Source: existing run-pipeline.ts pattern — Stage 1.5 inserted between Stage 1 and Stage 2
// crawler/src/pipeline/run-pipeline.ts (modified section)

import { runVisualScanner } from './stage1-5-vision-scanner'

export async function runAIPipeline(
  jobId: string,
  signals: { mobile: CrawlPass; desktop: CrawlPass },
  screenshot: Buffer | null,
  techProfile: TechProfile,
  externalSignals: ExternalSignals | null,
): Promise<void> {
  // Stage 1: deterministic scoring
  const scoredIssues = scoreSignals(signals.mobile, signals.desktop)
  scoredIssues.push(...scoreExternalSignals(externalSignals ?? { cwv: null, lighthouse: null }))
  scoredIssues.push(...scoreAxeViolations(signals.desktop.axeViolations ?? []))

  // Stage 1.5: vision scanner — insert visual issues into scoredIssues BEFORE Stage 2
  const client = getGroqClient()
  if (screenshot) {
    const visualIssues = await runVisualScanner(client, screenshot)
    scoredIssues.push(...visualIssues)
    console.log(`[pipeline] Job ${jobId}: Stage 1.5 complete — ${visualIssues.length} visual issues`)
  }

  console.log(`[pipeline] Job ${jobId}: ${scoredIssues.length} total issues scored`)

  // ... zero-issues path unchanged ...

  // Stage 2: extended — now returns fix_suggestion + severity_justification per issue
  const { enrichedIssues, edges } = await runStage2Reasoning(client, scoredIssues)

  // Page-type detection and benchmark context (deterministic, no LLM)
  const pageType = detectPageType(techProfile, signals.desktop.domSignals)
  const benchmarkContext = buildBenchmarkContext(externalSignals?.cwv ?? null, pageType)

  // Stage 3: enriched input
  const narrative = await runStage3Narration(client, enrichedIssues, edges, pageType, benchmarkContext)

  // DB write: enrichedIssues now include fix_suggestion + severity_justification
  // ...
}
```

### Stage 3 Extended Signature

```typescript
// Modified stage3-narrator.ts signature
export async function runStage3Narration(
  client: Groq,
  enrichedIssues: EnrichedIssue[],
  edges: CausalEdgeCandidate[],
  pageType: PageType,       // NEW: AI-03
  benchmarkContext: string, // NEW: AI-04 (empty string when no CWV data)
): Promise<NarrativeResult>
```

Stage 3 system prompt addition:

```
[PAGE TYPE AND CONTEXT]
${pageType !== 'unknown' ? `This is a ${pageType}. Tailor your narrative framing, examples, and recommendations to this specific page type.` : ''}

[BENCHMARK COMPARISONS]
${benchmarkContext || '(No real-user CWV field data available for this URL — do not include benchmark comparisons.)'}

When CWV benchmark context is provided:
- Open the [TECHNICAL PERFORMANCE] section with the benchmark comparison (e.g. "Real user data shows LCP of 3.8s — 1.5× the 2.5s good threshold")
- Connect metric values to business impact relevant to the page type
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Gemini as LLM provider | Groq `llama-3.3-70b-versatile` | Phase 3 (v1.0) | Groq free tier has 14,400 RPD vs Gemini's exhausted quota |
| No vision analysis | `meta-llama/llama-4-scout-17b-16e-instruct` for screenshot analysis | Phase 7 (this phase) | Surfaces visual/contrast/layout issues invisible to DOM analysis |
| Generic narrative for all page types | Page-type aware narrative | Phase 7 (this phase) | Narrative frames issues in terms relevant to the page's business context |
| No benchmark framing | CWV threshold-relative benchmarks | Phase 7 (this phase) | "Your LCP is 1.5× the good threshold" is more actionable than "LCP: 3.8s" |
| `technical_description` only per issue | + `fix_suggestion` + `severity_justification` | Phase 7 (this phase) | Issues become directly actionable without further interpretation |

**Deprecated/outdated:**
- `meta-llama/llama-3.2-11b-vision-preview` and `meta-llama/llama-3.2-90b-vision-preview`: Both deprecated by Groq as of March 2025. [CITED: console.groq.com/docs/deprecations] The current vision model is `meta-llama/llama-4-scout-17b-16e-instruct`.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `meta-llama/llama-4-scout-17b-16e-instruct` supports forced `tool_choice` with image content in the same request | Stage 1.5 Pattern | If tool_choice + image is not supported, fall back to JSON mode (`response_format: { type: 'json_object' }`) — slightly less reliable but functional |
| A2 | Stage 2 `max_tokens: 4096` is sufficient for 20+ issues with 3 fields each | Pitfall 3 | If still hitting token limit at 4096, would need to either increase further or cap the issue list before Stage 2 |
| A3 | Deterministic heuristics will detect page type accurately enough to be useful | Page-Type Detector | If heuristics return 'unknown' for 90%+ of pages, the feature provides no value — but fails gracefully since 'unknown' = current behavior |
| A4 | Desktop screenshot at JPEG quality 82, `fullPage: false`, 1440×900 is reliably < 2.5MB | Pitfall 1 | If typical screenshots are larger, the 2.5MB pre-encode guard will fire frequently, silently disabling SIGNAL-04 |
| A5 | `fix_suggestion` advisory-language refine check (rejecting "Consider...", "You might...") is useful | Pitfall 5 | If the LLM reliably uses imperative framing from the prompt alone, the refine check adds no value; it is harmless |
| A6 | Per-vertical industry benchmark medians are not officially published by Google or HTTP Archive | Benchmark Context | If an authoritative source exists, richer "your LCP is 1.2× the e-commerce median" framing would be more impactful |
| A7 | `llama-3.3-70b-versatile` (Stage 2 + 3) and `llama-4-scout-17b-16e-instruct` (Stage 1.5) both have 1,000 RPD on free tier | Rate limits | If vision model has a different (lower) RPD, the bottleneck math changes |

**If this table is empty:** All claims were verified. (It is not empty — A1, A3, A4 are the highest-risk assumptions.)

---

## Open Questions (RESOLVED)

1. **Does forced `tool_choice` work with multimodal image inputs on `llama-4-scout`?**
   - What we know: Groq docs say the model "supports tool use" and "JSON mode" with image inputs; the vision example shows a `tools` + `tool_choice` cURL example
   - What's unclear: Whether the TypeScript `groq-sdk` multipart message format `[{type: 'text', ...}, {type: 'image_url', ...}]` in the user message is compatible with forced tool calling in the same request
   - Recommendation: Wave 0 in Plan 07-01 should include a smoke test of `tool_choice` + image — if it fails, fall back to JSON mode pattern

2. **Should Stage 1.5 run in parallel with Stage 2, or serially before it?**
   - What we know: Stage 2 needs visual issues in its input to reason about them and form causal edges. Parallel execution would prevent Stage 2 from seeing them.
   - What's unclear: Whether visual issues in Stage 2 input materially improve Stage 2 quality (they may be too low-signal for causal edges)
   - Recommendation: Run Stage 1.5 serially before Stage 2 (design above). If the pipeline becomes too slow, Stage 1.5 could be demoted to "parallel enrichment" that only feeds into Stage 3 narrative, not Stage 2 causal reasoning.

3. **Prisma migration strategy for non-nullable columns on existing data**
   - What we know: `@default("")` will let the migration run on existing rows.
   - What's unclear: Whether the team wants `""` as a permanent sentinel or prefers a `NULL`-able column with optional display.
   - Recommendation: Use `@default("")` for migration compatibility. Plan 07-02 should include a note to the planner on this choice.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `groq-sdk` | Stage 1.5 vision call | ✓ | 1.2.0 | — |
| `zod` | Schema validation | ✓ | 4.4.3 | — |
| `GROQ_API_KEY` | All LLM calls | ✓ (assumed configured — already used in Stages 2+3) | — | Job fails at Stage 2 (same as before) |
| `meta-llama/llama-4-scout-17b-16e-instruct` | Stage 1.5 | ✓ Preview | — | If model deprecated: return [] from runVisualScanner and log warning |
| `BLOB_READ_WRITE_TOKEN` | Screenshot already uploaded in run-pipeline.ts | ✓ (assumed — used since Phase 3) | — | screenshot upload fails gracefully already |
| Groq RPD for vision model | Stage 1.5 (1,000 RPD) | ✓ | — | On 429: catch + return [], job continues without visual issues |
| Prisma migration tooling | New Issue columns | ✓ | 7.8.0 | — |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:**
- Groq vision model rate limit exceeded → Stage 1.5 returns `[]` gracefully.
- `BLOB_READ_WRITE_TOKEN` absent → `screenshot` parameter arrives as `null` → Stage 1.5 skipped (no buffer to encode).

---

## Validation Architecture

**nyquist_validation: true** (from `.planning/config.json`)

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (crawler/vitest.config.ts) |
| Config file | `crawler/vitest.config.ts` — includes `src/**/*.test.ts` |
| Quick run command | `npm test -- --reporter=dot crawler/src/pipeline/stage1-5-vision-scanner.test.ts` |
| Full suite command | `npm test` (from repo root) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SIGNAL-04 | `parseVisualIssues` maps tool output to `ScoredIssue[]` with correct signal_source prefix | unit | `npm test -- crawler/src/pipeline/stage1-5-vision-scanner.test.ts` | ❌ Wave 0 |
| SIGNAL-04 | `parseVisualIssues` caps at 5 issues | unit | `npm test -- crawler/src/pipeline/stage1-5-vision-scanner.test.ts` | ❌ Wave 0 |
| SIGNAL-04 | `runVisualScanner` returns `[]` when screenshot buffer exceeds 2.5MB | unit | `npm test -- crawler/src/pipeline/stage1-5-vision-scanner.test.ts` | ❌ Wave 0 |
| SIGNAL-04 | `runVisualScanner` returns `[]` on Groq API error (non-blocking) | unit | `npm test -- crawler/src/pipeline/stage1-5-vision-scanner.test.ts` | ❌ Wave 0 |
| AI-01 | Stage 2 extended schema validates `fix_suggestion` (required, max 300 chars) | unit | `npm test -- crawler/src/pipeline/stage2-reasoner.test.ts` | ❌ Wave 0 (modify existing) |
| AI-01 | `parseStage2Output` includes `fix_suggestion` on enriched issues | unit | `npm test -- crawler/src/pipeline/stage2-reasoner.test.ts` | ❌ Wave 0 (modify existing) |
| AI-02 | Stage 2 extended schema validates `severity_justification` (required, max 300 chars) | unit | `npm test -- crawler/src/pipeline/stage2-reasoner.test.ts` | ❌ Wave 0 (modify existing) |
| AI-03 | `detectPageType` returns 'e-commerce' when techProfile.payments is set | unit | `npm test -- crawler/src/pipeline/page-type-detector.test.ts` | ❌ Wave 0 |
| AI-03 | `detectPageType` returns 'blog' for high semanticScore.articleCount | unit | `npm test -- crawler/src/pipeline/page-type-detector.test.ts` | ❌ Wave 0 |
| AI-03 | `detectPageType` returns 'unknown' as fallback | unit | `npm test -- crawler/src/pipeline/page-type-detector.test.ts` | ❌ Wave 0 |
| AI-04 | `buildBenchmarkContext` returns empty string when cwv is null | unit | `npm test -- crawler/src/pipeline/benchmark-context.test.ts` | ❌ Wave 0 |
| AI-04 | `buildBenchmarkContext` includes "GOOD" label when LCP ≤ 2500ms | unit | `npm test -- crawler/src/pipeline/benchmark-context.test.ts` | ❌ Wave 0 |
| AI-04 | `buildBenchmarkContext` includes ratio multiplier for poor LCP | unit | `npm test -- crawler/src/pipeline/benchmark-context.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Quick run on the specific test file being modified
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `crawler/src/pipeline/stage1-5-vision-scanner.test.ts` — covers SIGNAL-04 parse/validate/error-handling
- [ ] `crawler/src/pipeline/page-type-detector.test.ts` — covers AI-03 heuristic rules
- [ ] `crawler/src/pipeline/benchmark-context.test.ts` — covers AI-04 context builder
- [ ] Modify `crawler/src/pipeline/stage2-reasoner.test.ts` — add tests for new `fix_suggestion` + `severity_justification` fields
- [ ] Prisma migration file — `prisma/migrations/` (new migration, never edit existing)

---

## Security Domain

`security_enforcement` is not explicitly set in `.planning/config.json` — treating as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Phase 7 does not add auth paths |
| V3 Session Management | No | Stateless pipeline |
| V4 Access Control | No | No new endpoints |
| V5 Input Validation | Yes | Zod schema validation on all LLM outputs; screenshot size guard before Groq call |
| V6 Cryptography | No | No new crypto operations |

### Known Threat Patterns for AI/Vision Pipeline

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Prompt injection via screenshot content | Tampering | Structured tool-call output (not free text parsing) limits injection surface; vision model only sees a JPEG, not HTML |
| Oversized image causing memory exhaustion | DoS | Pre-encode size guard (2.5MB check before base64 conversion) prevents OOM in the crawler process |
| LLM hallucinated fix_suggestion containing executable code or XSS | Tampering | fix_suggestion is stored as plain text and rendered as text in the UI — not executed; max 300 char Zod limit limits surface area |
| Groq API key leakage | Information Disclosure | `GROQ_API_KEY` is already in use; no new secret handling required; never logged |

---

## Sources

### Primary (HIGH confidence)
- [console.groq.com/docs/vision](https://console.groq.com/docs/vision) — Vision model ID, image format (base64 `data:image/jpeg;base64,...`), 4MB base64 limit, tool use support with images
- [console.groq.com/docs/model/meta-llama/llama-4-scout-17b-16e-instruct](https://console.groq.com/docs/model/meta-llama/llama-4-scout-17b-16e-instruct) — Model ID `meta-llama/llama-4-scout-17b-16e-instruct`, context 131K, max output 8192 tokens, Preview status
- [console.groq.com/docs/rate-limits](https://console.groq.com/docs/rate-limits) — llama-4-scout: 30 RPM, 30K TPM, 1K RPD; llama-3.3-70b: 30 RPM, 12K TPM, 1K RPD (free tier)
- [web.dev/articles/vitals](https://web.dev/articles/vitals) — Official LCP/INP/CLS thresholds (LCP ≤2.5s good, ≤4s poor; INP ≤200ms good, ≤500ms poor; CLS ≤0.1 good, ≤0.25 poor)
- [console.groq.com/docs/deprecations](https://console.groq.com/docs/deprecations) — llama-3.2-11b-vision-preview and llama-3.2-90b-vision-preview deprecated
- groq-sdk npm registry — version 1.2.0, published 2024-02-16, no postinstall scripts, slopcheck [OK]

### Secondary (MEDIUM confidence)
- [almanac.httparchive.org/en/2025/performance](https://almanac.httparchive.org/en/2025/performance) — Mobile good-LCP pass rate 62%, good-INP 77%, good-CLS 81% (2025 aggregate data; no per-industry breakdown)
- [console.groq.com/docs/structured-outputs](https://console.groq.com/docs/structured-outputs) — Tool use + JSON schema pattern; Zod compatible
- Phase 6 RESEARCH.md + SUMMARYs — Stage 1 pipeline architecture, ExternalSignals shape, ScoredIssue contract

### Tertiary (LOW confidence)
- [dev.to/dharanidharan_d_tech/fix-lcp-inp-cls-in-2026-the-complete-core-web-vitals-guide-with-real-benchmarks-54cl](https://dev.to/dharanidharan_d_tech/fix-lcp-inp-cls-in-2026-the-complete-core-web-vitals-guide-with-real-benchmarks-54cl) — E-commerce LCP impact data (conversion correlation); community article, not Google official
- [www.grizzlypeaksoftware.com/articles/p/groq-api-free-tier-limits-in-2026-what-you-actually-get-uwysd6mb](https://www.grizzlypeaksoftware.com/articles/p/groq-api-free-tier-limits-in-2026-what-you-actually-get-uwysd6mb) — Corroborates RPD figures; secondary source

---

## Metadata

**Confidence breakdown:**
- Standard stack (no new packages): HIGH — Phase 7 reuses all existing dependencies
- Vision API integration: HIGH — Official Groq docs confirm model ID, base64 format, tool use support
- Stage 2 extension (AI-01 + AI-02): HIGH — Extends an existing, well-tested pattern
- Page-type detection (AI-03): HIGH for architecture (deterministic heuristics); MEDIUM for heuristic accuracy
- Benchmark data (AI-04): HIGH for official thresholds; LOW for per-industry median framing (no authoritative source)
- Groq rate limits: HIGH for free-tier limits (confirmed via official docs)

**Research date:** 2026-05-27
**Valid until:** 2026-06-27 (30 days; Groq models in Preview status may change; rate limits may change for Developer tier)
