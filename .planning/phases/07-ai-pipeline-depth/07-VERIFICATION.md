---
phase: 07-ai-pipeline-depth
verified: 2026-05-28T00:00:00Z
status: human_needed
score: 18/20 must-haves verified
overrides_applied: 0
human_verification:
  - test: "After a full live job run with Groq inference, open /results/[jobId] and confirm the 'fix' and 'impact' rows appear in each issue card that has AI enrichment"
    expected: "Each IssueCard shows a 'fix' row with the fix_suggestion text and an 'impact' row with the severity_justification text. Pre-Phase-7 rows (empty strings) show neither row."
    why_human: "Conditional rendering depends on runtime LLM output. Grep confirms the conditional {issue.fix_suggestion && ...} logic exists and IssueCardProps is wired, but actual display requires a live job with non-empty DB values."
  - test: "Verify that Stage 3 narrative opens with page-type framing when page type is detected"
    expected: "For a detected e-commerce or landing-page site, the narrative summary or technical performance section references the page type context (e.g. 'E-commerce page', 'landing page')"
    why_human: "The dynamic systemPrompt construction exists and is confirmed wired. Whether the LLM uses the injected framing in its output requires a live inference run."
---

# Phase 7: AI Pipeline Depth — Verification Report

**Phase Goal:** Deepen the AI pipeline — add visual signal coverage (Stage 1.5), richer per-issue explanations (fix_suggestion + severity_justification), page-type-aware benchmarking (Stage 3), and UI display of all new fields.
**Verified:** 2026-05-28
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Visual UX issues (contrast, layout, hierarchy, CTA visibility, spacing) appear as ScoredIssue[] entries after a job run | VERIFIED | `stage1-5-vision-scanner.ts` exports `runVisualScanner` returning `ScoredIssue[]` with `signal_source` prefixed `visual.{category}` and `category='perceived-perf'`. Wired in `run-pipeline.ts` line 63. |
| 2 | Stage 1.5 is non-blocking: screenshot > 2.5MB returns [] without crashing | VERIFIED | `if (screenshotBuffer.length > 2_500_000) { ... return [] }` at line 107 of vision scanner. Test 5 confirms no Groq call is made. |
| 3 | Stage 1.5 is non-blocking: Groq API error returns [] without crashing | VERIFIED | Entire LLM call wrapped in `try/catch` returning `[]` at line 143. Test 6 mocks `create` throwing `new Error('Groq 429')` and asserts result is `[]`. |
| 4 | Visual issues enter scoredIssues BEFORE Stage 2 | VERIFIED | `run-pipeline.ts` lines 62-66: Stage 1.5 block runs after `scoreAxeViolations` push but before `uploadScreenshot` and Stage 2 call at line 101. `client = getGroqClient()` appears exactly once (line 61). |
| 5 | Every EnrichedIssue has fix_suggestion containing a specific imperative action | VERIFIED | `types.ts` line 16: `fix_suggestion: string` (non-optional). `Stage2OutputSchema` validates `min(1).max(300)`. `parseStage2Output` spreads `item.fix_suggestion` (line 153). SYSTEM_PROMPT rules for imperative framing present. |
| 6 | Every EnrichedIssue has severity_justification estimating user impact | VERIFIED | `types.ts` line 17: `severity_justification: string` (non-optional). `Stage2OutputSchema` validates `min(1).max(300)`. `parseStage2Output` spreads `item.severity_justification` (line 154). |
| 7 | Stage 2 Zod schema validates both new fields as required, max 300 chars | VERIFIED | `stage2-reasoner.ts` lines 109-113: `fix_suggestion: z.string().min(1).max(300).refine(...)`, `severity_justification: z.string().min(1).max(300)`. Tests B and C confirm parse throws on missing/overlength values. |
| 8 | fix_suggestion values starting with advisory language are rejected by Zod .refine() | VERIFIED | `.refine((v) => !['Consider ', 'You might', 'You could', 'Try to', 'It is recommended'].some((p) => v.startsWith(p))` at line 110. Tests D and E confirm throws for 'Consider ' and 'You might'. Note: refine is case-sensitive (WR-03 in REVIEW.md). |
| 9 | Prisma Issue model has fix_suggestion and severity_justification as non-nullable String with @default('') | VERIFIED | `prisma/schema.prisma` lines 59-60: `fix_suggestion String @default("")` and `severity_justification String @default("")`. Crawler's `crawler/prisma/schema.prisma` lines 61-62 match. |
| 10 | Stage 2 max_tokens increased to 4096 | VERIFIED | `stage2-reasoner.ts` line 196: `max_tokens: 4096`. |
| 11 | detectPageType returns correct page type for each of 5 PageType values | VERIFIED | `page-type-detector.ts` implements 5-rule early-return classifier. All 6 unit tests cover all 5 types including 'unknown' fallback. |
| 12 | buildBenchmarkContext returns empty string when cwv is null | VERIFIED | `benchmark-context.ts` line 28: `if (!cwv) return ''`. Test 1 confirms. |
| 13 | buildBenchmarkContext includes GOOD/NEEDS IMPROVEMENT/POOR labels and ratio multiplier for LCP when CWV data is available | VERIFIED | Lines 38-41 compute status and ratio. Tests 2-4 confirm correct label selection. `2.0×` ratio string confirmed via node computation (5000/2500 = 2.0, uses `×` character matching test assertion). |
| 14 | Stage 3 narrative uses page-type framing when pageType is not 'unknown' | VERIFIED (wiring confirmed, runtime output needs human check) | `stage3-narrator.ts` lines 77-86: `systemPrompt` dynamically constructed inside `runStage3Narration` with page-type framing injected. `run-pipeline.ts` line 110 passes `pageType` and `benchmarkContext`. |
| 15 | Stage 3 narrative includes benchmark comparisons when CWV data is available | VERIFIED (wiring confirmed, runtime output needs human check) | `buildBenchmarkContext` produces benchmark paragraph; passed as `benchmarkContext` to `runStage3Narration`; injected into `systemPrompt` at lines 82-86 with LLM instruction to open TECHNICAL PERFORMANCE section with benchmark comparison. |
| 16 | IssueCard renders a 'fix' row when fix_suggestion is non-empty | VERIFIED | `IssueCard.tsx` lines 48-53: `{issue.fix_suggestion && (<p>...<span>fix </span><span>{issue.fix_suggestion}</span></p>)}`. Pattern is conditional on truthiness (empty string is falsy). |
| 17 | IssueCard renders an 'impact' row when severity_justification is non-empty | VERIFIED | `IssueCard.tsx` lines 54-59: `{issue.severity_justification && (<p>...<span>impact </span><span>{issue.severity_justification}</span></p>)}`. |
| 18 | IssueCard does not render fix/impact rows when fields are empty strings | VERIFIED | Conditional rendering uses `{issue.fix_suggestion && ...}` — empty string is falsy in JS, so pre-Phase-7 `@default('')` rows suppress both rows without explicit `!== ''` check. |
| 19 | Results page passes fix_suggestion and severity_justification from Prisma query to IssueCard | VERIFIED | `results/[jobId]/page.tsx` lines 181-190: inline type annotation includes `fix_suggestion: string` and `severity_justification: string` (non-optional, matching post-migration Prisma type). IssueCard receives these via `<IssueCard key={issue.id} issue={issue} />`. |
| 20 | TypeScript compiles without errors in modified files | UNCERTAIN | SUMMARY.md reports typecheck passes on main repo files. Worktree isolation artifacts (missing `node_modules`) prevented full `npm run build` in the executor environment. No new type errors were introduced per SUMMARY.md self-check. Human verification (full build run) required for CI confidence. |

**Score: 18/20 truths verified (2 require human or runtime verification)**

---

### Roadmap Success Criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| SC-1 | Each issue includes a concrete fix suggestion (specific action, not advisory) | VERIFIED | Stage2OutputSchema .refine() enforces imperative framing. fix_suggestion wired from schema → types → DB write → IssueCard. |
| SC-2 | Each issue includes a severity justification paragraph naming user impact | VERIFIED | severity_justification in schema, types, DB write, and IssueCard 'impact' row. |
| SC-3 | Narrative opening identifies detected page type and tailors framing | VERIFIED (wiring) / UNCERTAIN (runtime) | detectPageType + buildBenchmarkContext wired into Stage 3 call. Actual LLM output framing requires live inference check. |
| SC-4 | When CWV data is available, narrative includes at least one benchmark comparison | VERIFIED (wiring) / UNCERTAIN (runtime) | benchmarkContext built from cwv data, injected into systemPrompt with explicit instruction to open TECHNICAL PERFORMANCE with benchmark comparison. |
| SC-5 | Screenshot visual findings appear as a distinct issue category | VERIFIED | stage1-5-vision-scanner returns `category: 'perceived-perf'` with `signal_source: 'visual.{category}'`. Distinct from DOM signals by signal_source prefix `visual.`. |

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `crawler/src/pipeline/stage1-5-vision-scanner.ts` | runVisualScanner, parseVisualIssues, VisualIssuesSchema exports | VERIFIED | File exists, 148 lines, all 3 exports confirmed. Model string is `meta-llama/llama-4-scout-17b-16e-instruct`. 2.5MB guard at line 107. try/catch at line 114. |
| `crawler/src/pipeline/stage1-5-vision-scanner.test.ts` | 6 tests covering parse, cap, size-guard, API-error | VERIFIED | File exists with 6 tests across 3 describe blocks. All test behaviors match plan specification. |
| `crawler/src/pipeline/run-pipeline.ts` | Stage 1.5 wired between scoreAxeViolations push and Stage 2 call | VERIFIED | Import at line 11, Stage 1.5 block at lines 61-66 (after scoreAxeViolations line 56, before uploadScreenshot line 69). getGroqClient() appears exactly once (line 61). |
| `crawler/src/pipeline/types.ts` | EnrichedIssue with fix_suggestion and severity_justification | VERIFIED | Lines 16-17: `fix_suggestion: string` and `severity_justification: string` as non-optional fields. |
| `crawler/src/pipeline/stage2-reasoner.ts` | Extended tool, schema with fix_suggestion+severity_justification, max_tokens 4096 | VERIFIED | Tool required array at line 77 includes both new fields. Schema at lines 109-113 validates both. max_tokens at line 196 is 4096. parseStage2Output spreads both fields. |
| `crawler/src/pipeline/stage2-reasoner.test.ts` | Tests A-F for new fields | VERIFIED | Tests A-F present at lines 190-300. All test behaviors match plan specification. |
| `prisma/schema.prisma` | Issue model with fix_suggestion and severity_justification @default("") | VERIFIED | Lines 59-60 confirmed. |
| `crawler/prisma/schema.prisma` | Issue model with fix_suggestion and severity_justification @default("") | VERIFIED | Lines 61-62 confirmed. NOTE: CR-04 from REVIEW.md: datasource db block at lines 14-16 has `provider = "postgresql"` but NO `url` field — a BLOCKER for Docker-based crawler Prisma generation. Comment at line 5 acknowledges this requirement but it was not implemented. |
| `crawler/src/pipeline/page-type-detector.ts` | PageType type, detectPageType function | VERIFIED | File exists, exports `PageType` at line 6 and `detectPageType` at line 8. Pure function with no side effects. |
| `crawler/src/pipeline/page-type-detector.test.ts` | 6 tests for all 5 PageType values | VERIFIED | File exists with 6 tests covering all 5 type values. |
| `crawler/src/pipeline/benchmark-context.ts` | buildBenchmarkContext, CWV_THRESHOLDS | VERIFIED | File exists, `CWV_THRESHOLDS` at line 10, `PAGE_TYPE_CONTEXT` at line 19, `buildBenchmarkContext` exported at line 27. |
| `crawler/src/pipeline/benchmark-context.test.ts` | 6 tests: null CWV, labels, ratio, origin_fallback, CLS | VERIFIED | File exists with 6 tests. Note: Test 3 asserts `'2.0×'` — runtime confirms `(5000/2500).toFixed(1) + '×'` = `'2.0×'` which matches the `×` Unicode character in the implementation. |
| `crawler/src/pipeline/stage3-narrator.ts` | runStage3Narration with pageType and benchmarkContext params | VERIFIED | Imports `PageType` at line 4. Signature at lines 70-73 has both new params. Dynamic systemPrompt built at lines 77-86 inside the function (not at module scope). |
| `src/components/IssueCard.tsx` | IssueCardProps extended with fix_suggestion? and severity_justification?; conditional rendering | VERIFIED | Props at lines 19-20 (optional `?`). Conditional renders at lines 48-53 (fix) and 54-59 (impact). JSX text children — no dangerouslySetInnerHTML. |
| `src/app/results/[jobId]/page.tsx` | Inline type extended with fix_suggestion and severity_justification | VERIFIED | Lines 188-189: `fix_suggestion: string` and `severity_justification: string` (non-optional, matching post-07-02-migration Prisma type). |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `run-pipeline.ts` | `stage1-5-vision-scanner.ts` | `import { runVisualScanner }` then `await runVisualScanner(client, screenshot)` | WIRED | Import at line 11; call at line 63 inside `if (screenshot)` block. |
| `stage1-5-vision-scanner.ts` | `groq-sdk` | `client.chat.completions.create` with `meta-llama/llama-4-scout-17b-16e-instruct` | WIRED | `groq-sdk` import at line 4; model string at line 116 confirmed. |
| `stage2-reasoner.ts` | `types.ts` | `import EnrichedIssue` including `fix_suggestion`, `severity_justification` | WIRED | `fix_suggestion` and `severity_justification` in both `EnrichedIssue` (types.ts) and `parseStage2Output` merge (stage2-reasoner.ts line 153-154). |
| `run-pipeline.ts` | `prisma Issue.create` | `enrichedIssues.map` includes fix_suggestion, severity_justification | WIRED | Line 135: `fix_suggestion: issue.fix_suggestion`, line 136: `severity_justification: issue.severity_justification`. |
| `run-pipeline.ts` | `page-type-detector.ts` | `detectPageType(techProfile, signals.desktop.domSignals)` | WIRED | Import at line 12; call at line 105. |
| `run-pipeline.ts` | `benchmark-context.ts` | `buildBenchmarkContext(externalSignals?.cwv ?? null, pageType)` | WIRED | Import at line 13; call at line 106. |
| `run-pipeline.ts` | `stage3-narrator.ts` | `runStage3Narration(client, enrichedIssues, edges, pageType, benchmarkContext)` | WIRED | Call at line 110 with all 5 parameters. |
| `results/[jobId]/page.tsx` | `IssueCard.tsx` | `issue.map` result passed as issue prop with fix_suggestion + severity_justification | WIRED | Inline type at lines 188-189 includes both fields; IssueCard receives full `issue` object at line 190. |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `IssueCard.tsx` | `issue.fix_suggestion`, `issue.severity_justification` | Prisma DB query in `results/[jobId]/page.tsx` (`prisma.result.findUnique` with `include: { issues: true }`) | Yes — DB rows written by `run-pipeline.ts` from LLM output via Stage 2 | FLOWING (wiring confirmed; DB population requires live job run — see human verification) |
| `stage3-narrator.ts` systemPrompt | `pageType`, `benchmarkContext` | `detectPageType()` reads live `techProfile` and `domSignals`; `buildBenchmarkContext()` reads live `externalSignals?.cwv` | Yes — runtime values per crawl, not hardcoded | FLOWING |
| `stage1-5-vision-scanner.ts` | `visualIssues` | Groq vision API with base64-encoded screenshot buffer | Yes — real LLM call; returns `[]` on any error (non-blocking) | FLOWING |

---

### Behavioral Spot-Checks

Step 7b skipped: tests cannot be run without crawler `node_modules` and live Groq API access. Unit tests confirmed present and correct via code inspection.

---

### Probe Execution

No probe files declared in PLAN.md files. No `scripts/*/tests/probe-*.sh` files exist for this phase.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SIGNAL-04 | 07-01 | Vision model feeds screenshot to surface visual/layout/contrast issues | SATISFIED | `stage1-5-vision-scanner.ts` with `VisualIssuesSchema`, `parseVisualIssues`, `runVisualScanner`. Wired in `run-pipeline.ts` as Stage 1.5. |
| AI-01 | 07-02, 07-03, 07-04 | Each issue includes concrete actionable fix suggestion (not advisory) | SATISFIED | `fix_suggestion` in `EnrichedIssue`, `Stage2OutputSchema` with `.refine()`, `parseStage2Output`, DB write, `IssueCard` 'fix' row. |
| AI-02 | 07-02, 07-03, 07-04 | Each issue includes severity justification estimating user impact | SATISFIED | `severity_justification` in `EnrichedIssue`, `Stage2OutputSchema`, `parseStage2Output`, DB write, `IssueCard` 'impact' row. |
| AI-03 | 07-03 | System detects page type and tailors narrative framing | SATISFIED (wiring) | `page-type-detector.ts` with 5-rule classifier. `runStage3Narration` receives `pageType` and injects into dynamic systemPrompt. |
| AI-04 | 07-03 | System compares crawled metrics against industry benchmarks | SATISFIED (wiring) | `benchmark-context.ts` with `CWV_THRESHOLDS`, GOOD/NEEDS IMPROVEMENT/POOR labels, ratio multiplier. Injected into Stage 3 systemPrompt. |

**All 5 Phase 7 requirements: SATISFIED by wiring. Runtime behavior for AI-03 and AI-04 requires human spot-check.**

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `crawler/prisma/schema.prisma` | 14-16 | `datasource db` block has `provider = "postgresql"` but NO `url` field — comment at line 5 acknowledges `url: env("DATABASE_URL")` is required but it was not added | WARNING (pre-existing) | `npx prisma generate` inside Docker container will fail without a url field. This is CR-04 from REVIEW.md — pre-existing and documented, not introduced by this phase. |
| `stage2-reasoner.ts` | 110 | `fix_suggestion` refine check is case-sensitive — `'consider '` (lowercase) bypasses the advisory language guard | WARNING | WR-03 from REVIEW.md. `'Consider '` with capital C is caught; `'consider '` is not. Does not affect phase goal achievement but weakens the quality gate. |
| `run-pipeline.ts` | 150-151 | `result.issues[edge.fromIndex]` access without bounds check inside `$transaction` — relies on Prisma returning issues in insertion order (not guaranteed by spec) | WARNING | CR-01 from REVIEW.md. Potential crash if Prisma returns issues in non-insertion order; indices could reference wrong issues or undefined. Does not affect goal achievement in normal operation. |

No `TBD`, `FIXME`, or `XXX` markers found in any Phase 7 modified files.

---

### Human Verification Required

#### 1. IssueCard fix and impact rows — live rendering check

**Test:** After submitting a URL that produces AI-enriched issues via a full job run (with Groq inference), open `/results/[jobId]` in a browser.
**Expected:** Each issue card shows a `fix` row with the fix_suggestion text in monospace and an `impact` row with the severity_justification text. For any pre-Phase-7 rows (empty strings from `@default('')`), neither row appears.
**Why human:** Conditional rendering on non-empty LLM output requires a live job run. Code inspection confirms the wiring and conditional logic, but DB values being populated by Stage 2 requires real Groq API inference.

#### 2. Stage 3 narrative page-type framing and benchmark comparisons

**Test:** Submit a URL for a known e-commerce or landing page with CWV data available (has CrUX coverage). Examine the narrative sections in the results page.
**Expected:** The narrative opens with framing relevant to the page type (e.g. references "E-commerce" or "landing page"). When CWV data is available, the TECHNICAL PERFORMANCE section includes at least one benchmark comparison with a metric value and threshold reference (e.g. "LCP of 3.8s — 1.5× the 2.5s good threshold").
**Why human:** The dynamic systemPrompt construction and Stage 3 wiring are confirmed. Whether the LLM actually uses the injected framing in its output (as opposed to ignoring the injected sections) requires live inference observation.

---

### Gaps Summary

No blocking gaps found. All required artifacts exist and are substantively implemented with correct wiring. The two human verification items cover runtime LLM output quality — the code wiring is confirmed correct.

**Notable findings from REVIEW.md that are not gaps for this phase:**
- CR-01 (unguarded array index in DB transaction): real risk in production, not a gap blocking phase goal
- CR-02 (Zod parse throws for >5 visual issues — caught by outer try/catch, but slice-before-validate would be safer): not a crash in practice
- CR-03 (SSRF in screenshot proxy route `src/app/api/screenshot/[jobId]/route.ts`): in a file not modified by this phase
- CR-04 (crawler/prisma/schema.prisma missing `url` field): pre-existing schema drift, not introduced by this phase
- WR-03 (case-sensitive refine check): weakens advisory language guard but does not break the requirement
- WR-04 (saas-dashboard heuristic excludes apps with analytics installed): logical gap in classifier, does not break phase goal

---

_Verified: 2026-05-28_
_Verifier: Claude (gsd-verifier)_
