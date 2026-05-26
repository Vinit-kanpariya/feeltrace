---
phase: 04-results-dashboard
plan: "05"
subsystem: results-dashboard
tags: [react-flow, client-components, clipboard, xyflow, lucide-react]
dependency_graph:
  requires: [04-03]
  provides: [CausalityGraph, ShareButton]
  affects: [04-06]
tech_stack:
  added: []
  patterns: [use-client boundary, React Flow canvas, navigator.clipboard API, TDD RED/GREEN]
key_files:
  created:
    - src/components/CausalityGraph.tsx
    - src/components/ShareButton.tsx
  modified: []
decisions:
  - "BackgroundVariant enum import required for type-safe variant prop (BackgroundVariant.Dots vs string literal)"
metrics:
  duration: 8min
  completed: "2026-05-26"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
requirements: [DASH-03, DASH-04]
---

# Phase 4 Plan 05: CausalityGraph + ShareButton Client Components Summary

CausalityGraph (React Flow canvas with Background/Controls/MiniMap) and ShareButton (2s clipboard copy with success state) — the two mandatory "use client" components for Phase 4.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create CausalityGraph.tsx (React Flow client component) | 1cb189c | src/components/CausalityGraph.tsx |
| 2 | Create ShareButton.tsx (clipboard client component) | a399672 | src/components/ShareButton.tsx |

## What Was Built

### CausalityGraph.tsx (1cb189c)
- `'use client'` directive — React Flow requires browser APIs (ResizeObserver, DOM measurement)
- `ReactFlow` canvas with `Background` (dots variant via `BackgroundVariant.Dots` enum), `Controls`, and `MiniMap`
- Props interface: `{ nodes: Node[]; edges: Edge[] }` — plain objects only, no Prisma instances
- Container: `w-full h-[320px] md:h-[480px]` — explicit pixel height prevents 0px collapse (Pitfall 5)
- No stylesheet import inside component — relies on `@import '@xyflow/react/dist/style.css'` already in globals.css (D-04)
- `fitView` and `colorMode="light"` configured on ReactFlow

### ShareButton.tsx (a399672)
- `'use client'` directive — navigator.clipboard is browser-only
- `navigator.clipboard.writeText(window.location.href)` on click
- `useState(false)` for `copied` state; `setCopied(true)` on success, `setTimeout(() => setCopied(false), 2000)` for 2s revert
- try/catch: on failure calls `alert('Could not copy link. URL: ' + url)` — no silent failure
- Button classes: `min-h-[44px] px-4 flex items-center gap-2 rounded border` + dynamic success/rest colors
- Rest: `border-blue-600 text-blue-600 bg-transparent`; Success: `bg-blue-600 border-blue-600 text-white`
- Icons: `Copy` (rest) / `Check` (success) from lucide-react, size 16
- Labels: "Copy share link" (rest) / "Link copied" (success)

## Verification Results

| Check | Result |
|-------|--------|
| ShareButton.test.tsx (3 tests) | PASS — all 3 GREEN |
| typecheck CausalityGraph.tsx | PASS — no errors |
| typecheck ShareButton.tsx | PASS — no errors |
| `'use client'` in both files | PASS — count: 2 |
| No @xyflow stylesheet import in CausalityGraph | PASS — count: 0 |
| h-[320px] in CausalityGraph | PASS — count: 1 |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] BackgroundVariant enum required instead of string literal**
- **Found during:** Task 1 typecheck
- **Issue:** `variant="dots"` is not assignable to `BackgroundVariant | undefined` — the prop expects the enum type, not a plain string
- **Fix:** Imported `BackgroundVariant` from `@xyflow/react` and used `BackgroundVariant.Dots` instead of the string literal `"dots"`
- **Files modified:** src/components/CausalityGraph.tsx
- **Commit:** 1cb189c (included in the same task commit)

## TDD Gate Compliance

- RED gate: ShareButton.test.tsx existed from Wave 0 (Plan 04-01) — import error confirmed failure before implementation
- GREEN gate: ShareButton.tsx implemented — 3/3 tests pass
- REFACTOR: not needed — implementation is minimal and clean

## Known Stubs

None — both components are fully wired. CausalityGraph accepts props from parent Server Component; ShareButton reads `window.location.href` at click time. No placeholder data.

## Threat Flags

None — no new network endpoints, auth paths, or file access patterns introduced. ShareButton writes only `window.location.href` to clipboard (T-04-06: accepted per plan threat model). CausalityGraph uses React JSX auto-escaping for node labels (T-04-07: mitigated). Props are typed as plain `Node[]`/`Edge[]` objects (T-04-08: mitigated).

## Self-Check: PASSED

Files created:
- [x] src/components/CausalityGraph.tsx — FOUND
- [x] src/components/ShareButton.tsx — FOUND

Commits:
- [x] 1cb189c — feat(04-05): create CausalityGraph React Flow client component — FOUND
- [x] a399672 — feat(04-05): create ShareButton clipboard client component — FOUND
