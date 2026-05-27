---
phase: 7
slug: ai-pipeline-depth
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-27
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `crawler/vitest.config.ts` |
| **Quick run command** | `npm test -- --reporter=dot crawler/src/pipeline/<file>.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick test on the specific test file modified
- **After every plan wave:** Run `npm test` (full suite)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 0 | SIGNAL-04 | T-7-01 | `parseVisualIssues` maps tool output to `ScoredIssue[]`; caps at 5 | unit | `npm test -- crawler/src/pipeline/stage1-5-vision-scanner.test.ts` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 0 | SIGNAL-04 | T-7-02 | `runVisualScanner` returns `[]` on buffer > 2.5MB (size guard) | unit | `npm test -- crawler/src/pipeline/stage1-5-vision-scanner.test.ts` | ❌ W0 | ⬜ pending |
| 07-01-03 | 01 | 0 | SIGNAL-04 | T-7-03 | `runVisualScanner` returns `[]` on Groq API error (non-blocking) | unit | `npm test -- crawler/src/pipeline/stage1-5-vision-scanner.test.ts` | ❌ W0 | ⬜ pending |
| 07-01-04 | 01 | 1 | SIGNAL-04 | — | Stage 1.5 integrated into `run-pipeline.ts`; visual issues in scoredIssues before Stage 2 | unit | `npm test -- crawler/src/pipeline/run-pipeline.test.ts` | ✅ | ⬜ pending |
| 07-02-01 | 02 | 0 | AI-01 | T-7-04 | Stage 2 schema validates `fix_suggestion` (required, max 300 chars) | unit | `npm test -- crawler/src/pipeline/stage2-reasoner.test.ts` | ✅ (modify) | ⬜ pending |
| 07-02-02 | 02 | 0 | AI-02 | — | Stage 2 schema validates `severity_justification` (required, max 300 chars) | unit | `npm test -- crawler/src/pipeline/stage2-reasoner.test.ts` | ✅ (modify) | ⬜ pending |
| 07-02-03 | 02 | 1 | AI-01/AI-02 | — | Prisma migration runs without error; Issue table has fix_suggestion + severity_justification columns | migration | `npm run db:migrate` | ❌ W0 | ⬜ pending |
| 07-03-01 | 03 | 0 | AI-03 | — | `detectPageType` returns 'e-commerce' when payments set; 'blog' for high articleCount; 'unknown' fallback | unit | `npm test -- crawler/src/pipeline/page-type-detector.test.ts` | ❌ W0 | ⬜ pending |
| 07-03-02 | 03 | 0 | AI-04 | — | `buildBenchmarkContext` returns '' when cwv=null; includes ratio for poor LCP; correct labels | unit | `npm test -- crawler/src/pipeline/benchmark-context.test.ts` | ❌ W0 | ⬜ pending |
| 07-03-03 | 03 | 1 | AI-03/AI-04 | — | Stage 3 receives pageType + benchmarkContext; typecheck passes | typecheck | `npm run typecheck` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `crawler/src/pipeline/stage1-5-vision-scanner.test.ts` — parse/validate/size-guard/error tests for SIGNAL-04
- [ ] `crawler/src/pipeline/page-type-detector.test.ts` — heuristic rule tests for AI-03
- [ ] `crawler/src/pipeline/benchmark-context.test.ts` — context builder tests for AI-04
- [ ] Modify `crawler/src/pipeline/stage2-reasoner.test.ts` — add `fix_suggestion` + `severity_justification` field tests (AI-01, AI-02)
- [ ] `prisma/migrations/<timestamp>_add_issue_enrichment_fields/migration.sql` — new migration (never edit existing)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Stage 1.5 produces real visual issues on a live URL | SIGNAL-04 | Requires live Groq vision API call with real screenshot | Run a crawl job, check DB for issues with `signal_source` starting with `visual.` |
| Stage 3 narrative opens with page-type framing | AI-03 | Requires live LLM inference | Crawl a known e-commerce URL, verify narrative mentions e-commerce/conversion context |
| Benchmark comparison appears in narrative for URL with CWV data | AI-04 | Requires live PSI + LLM call | Crawl a URL with CrUX data, verify narrative includes threshold-relative language (e.g. "1.5× the good threshold") |
| fix_suggestion uses imperative framing (not "Consider...") | AI-01 | LLM output quality check | Spot-check 5 issues in DB, verify none start with "Consider", "You might", "You could" |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
