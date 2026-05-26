---
phase: 3
slug: ai-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-26
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (root `vitest.config.mts`) |
| **Config file** | `vitest.config.mts` (project root — includes `crawler/src/**/*.test.ts`) |
| **Quick run command** | `npm test -- --run crawler/src/pipeline` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~5 seconds (existing 27 tests pass; 3 new test files added in Wave 0) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run crawler/src/pipeline`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-01 | Wave 0 | 0 | AI-01, AI-02, AI-03, AI-04 | — | N/A | unit (stubs) | `npm test -- --run crawler/src/pipeline` | ❌ W0 | ⬜ pending |
| 3-scorer | Stage 1 | 1 | AI-01, AI-04 | T-LLM-cost | Severity from thresholds, never from LLM | unit | `npm test -- --run crawler/src/pipeline/stage1-scorer.test.ts` | ❌ W0 | ⬜ pending |
| 3-reasoner | Stage 2 | 2 | AI-02, AI-04 | T-hallucination, T-prompt-inject | Mechanism enum validates; self-edge filtered | unit | `npm test -- --run crawler/src/pipeline/stage2-reasoner.test.ts` | ❌ W0 | ⬜ pending |
| 3-narrator | Stage 3 | 2 | AI-03, AI-04 | T-hallucination | Narrative split into 4 sections; perceived/technical distinct | unit | `npm test -- --run crawler/src/pipeline/stage3-narrator.test.ts` | ❌ W0 | ⬜ pending |
| 3-e2e | Final wave | 3 | AI-01–AI-04 | all | Full pipeline on real URL, DB records created | manual | human checkpoint with real URL | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `crawler/src/pipeline/stage1-scorer.test.ts` — threshold unit tests for AI-01 (severity classification) and AI-04 (perceived-perf vs technical-perf category)
- [ ] `crawler/src/pipeline/stage2-reasoner.test.ts` — Zod schema validation unit tests (mechanism enum, self-edge filter) for AI-02
- [ ] `crawler/src/pipeline/stage3-narrator.test.ts` — narrative parser unit tests (4-section split, perceivedPerformance/technicalPerformance field extraction) for AI-03, AI-04

*(No framework gaps — Vitest already configured and running 27 tests from Phase 2)*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live Claude API call produces non-empty narrative | AI-03 | LLM calls cannot be unit-tested; mock fixtures only | Run full pipeline with a real URL, check `Result.narrative` JSON in DB |
| Narrative readable by non-engineer | AI-03, AI-04 | Subjective quality judgment | PM/UX team reads narrative output for 3+ real sites before launch |
| Causality edges reference real mechanisms | AI-02 | Semantic correctness requires human review | Inspect `CausalEdge.mechanism` values for 3+ real sites; confirm non-trivial |
| ANTHROPIC_API_KEY is not logged or exposed | Security | Log inspection required | Confirm no `process.env.ANTHROPIC_API_KEY` in console output during pipeline run |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
