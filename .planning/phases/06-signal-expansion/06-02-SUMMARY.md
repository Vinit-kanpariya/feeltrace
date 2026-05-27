---
phase: "06"
plan: "02"
subsystem: "crawler"
tags: [axe-core, accessibility, wcag, playwright, signal-expansion]
dependency_graph:
  requires: [06-01 — AxeViolation types, CrawlPass.axeViolations field, scoreAxeViolations stub]
  provides: [axe WCAG 2.1 scan on desktop pass, scoreAxeViolations real implementation, axe ScoredIssues in pipeline]
  affects: [crawler/src/browser.ts, crawler/src/pipeline/stage1-external-scorer.ts, crawler/src/pipeline/run-pipeline.ts]
tech_stack:
  added: ["@axe-core/playwright ^4.11.3"]
  patterns: [bypassCSP spread-conditional (desktop-only), try/catch axe failure → [], first-occurrence-wins dedup, 10-ID cap, 5-nodes-per-violation defensive slice]
key_files:
  created: []
  modified:
    - crawler/package.json
    - crawler/package-lock.json
    - crawler/src/browser.ts
    - crawler/src/pipeline/stage1-external-scorer.ts
    - crawler/src/pipeline/run-pipeline.ts
    - crawler/src/pipeline/stage1-external-scorer.test.ts
decisions:
  - "bypassCSP uses spread-conditional (...(viewport==='desktop' ? {bypassCSP:true} : {})) so the mobile context object never receives the option — cleaner than an if/else newContext split"
  - "axeViolations declared as undefined, not [] — undefined on mobile pass signals 'not applicable'; [] on desktop signals 'scan ran, zero violations' — downstream can distinguish"
  - "Defensive re-slice to 5 nodes in scoreAxeViolations even though browser.ts already slices — guards against future callers passing unsliced violations"
metrics:
  duration: "~20 minutes"
  completed: "2026-05-27"
  tasks: 4
  files: 6
---

# Phase 06 Plan 02: axe-core Accessibility Integration Summary

axe-core WCAG 2.1 A+AA scan wired into the desktop Playwright pass via @axe-core/playwright, with bypassCSP on the desktop context, violation scoring through a real scoreAxeViolations() implementation, and 9 unit tests covering all scorer behaviours.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Install @axe-core/playwright | 29144e1 | crawler/package.json, crawler/package-lock.json |
| 2 | Browser integration (bypassCSP, AxeBuilder scan, axeViolations on CrawlPass) | efab6ee | crawler/src/browser.ts |
| 3 | scoreAxeViolations implementation + run-pipeline.ts wiring | 38e5d77 | crawler/src/pipeline/stage1-external-scorer.ts, run-pipeline.ts |
| 4 | Unit tests for scoreAxeViolations (9 test cases) | 09e9bf6 | crawler/src/pipeline/stage1-external-scorer.test.ts |

## Test Results

- **106 tests pass** (9 test files — 9 new axe scorer tests + 97 pre-existing)
- **9 new scoreAxeViolations tests** — empty input, 4 impact-to-severity mappings, 10-ID cap, 5-node raw_evidence limit, duplicate dedup, signal_source prefix, viewport field
- **typecheck: clean** (tsc --noEmit exits 0)

## Success Criteria Verification

- [x] @axe-core/playwright in crawler/package.json dependencies (^4.11.3)
- [x] browser.ts desktop context has bypassCSP: true (spread-conditional, mobile unchanged)
- [x] AxeBuilder scan with .withTags(['wcag2a','wcag21aa']) runs on desktop pass
- [x] axe failures caught; axeViolations = [] on error, never crashes job
- [x] scoreAxeViolations() filled in with real logic (impact map, dedup, cap, raw_evidence)
- [x] run-pipeline.ts appends scoreAxeViolations(signals.desktop.axeViolations ?? [])
- [x] 9 unit tests for scoreAxeViolations all pass
- [x] All 106 tests pass, typecheck clean

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — the scoreAxeViolations stub from Plan 06-01 has been replaced with a real implementation.

## Threat Flags

None — axe-core/playwright is an injected analysis library that reads DOM state. No new network endpoints, no auth paths, no file access patterns introduced.

## Self-Check: PASSED

- [x] crawler/src/browser.ts modified with AxeBuilder import, bypassCSP, axe scan block, axeViolations on return
- [x] crawler/src/pipeline/stage1-external-scorer.ts scoreAxeViolations body replaced (no longer stub)
- [x] crawler/src/pipeline/run-pipeline.ts appends scoreAxeViolations results
- [x] crawler/src/pipeline/stage1-external-scorer.test.ts has 9 new axe scorer tests
- [x] Commits 29144e1, efab6ee, 38e5d77, 09e9bf6 exist in git log
- [x] 106 tests pass, 0 failures
- [x] typecheck passes
