---
phase: 4
slug: results-dashboard
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-26
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.7 |
| **Config file** | `vitest.config.mts` (project root) |
| **Quick run command** | `npm run test:run` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

**Note:** `vitest.config.mts` `include` pattern may need updating from `src/**/*.test.ts` to `src/**/*.test.{ts,tsx}` to pick up React component test files. Wave 0 must verify and fix if needed.

---

## Sampling Rate

- **After every task commit:** Run `npm run test:run`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green + manual smoke test
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 0 | DASH-01 | — | SEVERITY_LABELS maps 1→"Low", 4→"Critical" | unit | `npm run test:run -- src/types/narrative.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 0 | DASH-01 | — | CATEGORY_LABELS maps all 3 keys correctly | unit | `npm run test:run -- src/types/narrative.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 0 | DASH-03 | — | meetsCredibilityThreshold: correct for all threshold cases | unit | `npm run test:run -- src/lib/graph-utils.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-04 | 01 | 0 | DASH-03 | — | buildGraphData produces correct node/edge positions | unit | `npm run test:run -- src/lib/graph-utils.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-05 | 01 | 0 | DASH-04 | — | ShareButton: clipboard.writeText called with correct URL | unit | `npm run test:run -- src/components/ShareButton.test.tsx` | ❌ W0 | ⬜ pending |
| 04-01-06 | 01 | 0 | D-03 | — | JobStatusBadge: router.push called on complete status | unit | `npm run test:run -- src/components/JobStatusBadge.test.tsx` | ❌ W0 | ⬜ pending |
| 04-01-07 | 01 | 0 | DASH-02 | — | NarrativeSection renders all 4 sub-sections (summary, perceived, technical, recommendations) | unit | `npm run test:run -- src/components/NarrativeSection.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/types/narrative.test.ts` — covers SEVERITY_LABELS and CATEGORY_LABELS constant correctness (DASH-01)
- [ ] `src/lib/graph-utils.test.ts` — covers `meetsCredibilityThreshold` (all threshold cases) and `buildGraphData` node/edge positions (DASH-03)
- [ ] `src/components/ShareButton.test.tsx` — covers clipboard API call and 2-second revert logic (DASH-04)
- [ ] `src/components/JobStatusBadge.test.tsx` — covers router.push on complete status (D-03 rewrite)
- [ ] `src/components/NarrativeSection.test.tsx` — covers rendering all 4 NarrativeResult sections (DASH-02)
- [ ] Verify `vitest.config.mts` `include` pattern covers `.test.{ts,tsx}` files — update if needed

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Results page renders correctly for smoke test record | DASH-01, DASH-02, DASH-03 | Requires real DB + browser; React Flow canvas is not unit-testable | Start dev server (`npm run dev`), visit `/results/cmpmjx5xo0000rcjd0nxrvh5g` (react.dev, 6 issues, 5 causal edges), verify: narrative visible above fold, 6 issue cards ordered Critical→Low, causality graph renders (5 edges, ≥1 high confidence) |
| Share link copy works | DASH-04 | navigator.clipboard requires browser context | Click "Copy share link", verify button shows "Link copied" for ~2 seconds, verify clipboard contains the page URL |
| JobStatusBadge navigates to results page | D-03 | Requires full job lifecycle in browser | Submit a URL, wait for analysis to complete, verify automatic redirect to `/results/{jobId}` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
