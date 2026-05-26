# Phase 4: Results Dashboard - Pattern Map

**Mapped:** 2026-05-26
**Files analyzed:** 13 (11 new, 2 modified)
**Analogs found:** 11 / 13

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/results/[jobId]/page.tsx` | route (Server Component) | request-response | `src/app/api/results/[jobId]/route.ts` | role-match (same data shape; SC page vs API route) |
| `src/app/results/[jobId]/loading.tsx` | route (Server Component) | request-response | `src/app/(dashboard)/page.tsx` | partial (same route-segment convention) |
| `src/app/results/[jobId]/not-found.tsx` | route (Server Component) | request-response | `src/app/(dashboard)/page.tsx` | partial (same route-segment convention) |
| `src/types/narrative.ts` | type definition | transform | `src/types/job.ts` | exact (same pattern: types file with interfaces + constants) |
| `src/components/NarrativeSection.tsx` | component (Server Component) | request-response | `src/components/AnalyzeForm.tsx` | partial (component structure; SC vs CC) |
| `src/components/IssueCard.tsx` | component (Server Component) | request-response | `src/components/AnalyzeForm.tsx` | partial (component structure; SC vs CC) |
| `src/components/SeverityBadge.tsx` | component (Server Component) | transform | `src/types/narrative.ts` (new) | no analog (pure display badge, no existing analog) |
| `src/components/CausalityGraph.tsx` | component (Client Component) | event-driven | `src/components/JobStatusBadge.tsx` | role-match (`"use client"`, useEffect, local state) |
| `src/components/GraphAbsent.tsx` | component (Server Component) | request-response | `src/app/(dashboard)/page.tsx` | partial (static JSX Server Component) |
| `src/components/ShareButton.tsx` | component (Client Component) | event-driven | `src/components/JobStatusBadge.tsx` | role-match (`"use client"`, useState, async handler) |
| `src/lib/graph-utils.ts` | utility | transform | `src/lib/ssrf.ts` | role-match (pure utility functions with no framework deps) |
| `src/components/JobStatusBadge.tsx` (rewrite) | component (Client Component) | event-driven | `src/components/JobStatusBadge.tsx` (current) | exact (rewrite of existing file) |
| `src/app/globals.css` (edit) | config | — | `src/app/globals.css` (current) | exact (append after existing `@import "tailwindcss"`) |

---

## Pattern Assignments

### `src/app/results/[jobId]/page.tsx` (route, request-response)

**Analog:** `src/app/api/results/[jobId]/route.ts`

**Imports pattern** (lines 1-3, 15-16):
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// Phase 4 Server Component equivalents:
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { NarrativeResult } from '@/types/narrative'
```

**Next.js 15 async params pattern** (lines 21-23 of route.ts):
```typescript
// CRITICAL: params is a Promise in Next.js 15 — must await before use
// Exact pattern from src/app/api/results/[jobId]/route.ts lines 21-23
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params
```
Page component equivalent:
```typescript
export default async function ResultsPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
```

**Prisma query pattern** (lines 44-47 of route.ts):
```typescript
// Fetch the Result with all associated issues and causal edges
const result = await prisma.result.findUnique({
  where: { jobId },           // lookup by jobId (@unique), NOT by result.id
  include: { issues: true, edges: true },
})
```
Phase 4 extends this with job and severity ordering:
```typescript
const result = await prisma.result.findUnique({
  where: { jobId },
  include: {
    job: true,
    issues: { orderBy: { severity: 'desc' } },  // Critical-first; enforced at query layer
    edges: true,
  },
})
```

**404 pattern** (lines 31-35 of route.ts):
```typescript
if (!job) {
  return NextResponse.json({ error: 'Job not found' }, { status: 404 })
}
```
Server Component equivalent — call `notFound()` (D-05):
```typescript
if (!result) notFound()
```

**Error handling** (lines 49-52 of route.ts):
```typescript
if (!result) {
  return NextResponse.json({ error: 'Result not found' }, { status: 404 })
}
```

---

### `src/app/results/[jobId]/loading.tsx` (route, request-response)

**Analog:** `src/app/(dashboard)/page.tsx` (co-located Server Component file convention)

**File convention pattern** (lines 1-10 of dashboard page.tsx):
```typescript
// No "use client" — Server Component by default
// Co-located in the route segment directory
// Next.js automatically wraps page.tsx in a Suspense boundary using loading.tsx

export default function ResultsLoading() {
  return (
    // Use animate-pulse + zinc-100/zinc-300 placeholder blocks
    // Mirror the visual layout of the actual page sections:
    // 1. Narrative section block (p-6, rounded, mb-8)
    // 2. Three issue card placeholders (p-4, rounded, mb-4)
    // 3. Graph panel placeholder (h-[480px])
  )
}
```
Tailwind skeleton convention (from RESEARCH.md Pattern 7):
```typescript
<div className="bg-zinc-100 rounded p-6 mb-8">
  <div className="h-4 bg-zinc-300 rounded w-3/4 mb-3" />
</div>
```

---

### `src/app/results/[jobId]/not-found.tsx` (route, request-response)

**Analog:** `src/app/(dashboard)/page.tsx` (co-located Server Component file convention)

**Imports pattern** (layout.tsx line 1 pattern — Next.js built-ins):
```typescript
import Link from 'next/link'
// No "use client" — Server Component by default
```

**Layout pattern** (dashboard page.tsx lines 3-10):
```typescript
// Match page layout convention: max-w-4xl mx-auto px-4 py-12
export default function ResultNotFound() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* copywriting from UI-SPEC */}
    </main>
  )
}
```

---

### `src/types/narrative.ts` (type definition, transform)

**Analog:** `src/types/job.ts` — exact same file pattern

**Full file structure** (job.ts lines 1-44):
```typescript
// src/types/job.ts — top comment block with source attribution
// Source: .planning/phases/...

/**
 * JSDoc block for each export
 */
export type JobStatus = ...

export interface JobStatusResponse { ... }

export const SEVERITY_LABELS: Record<1 | 2 | 3 | 4, string> = { ... }
```

**Copied types from** `crawler/src/pipeline/types.ts` (lines 30-44):
```typescript
// Stage 3 output: structured narrative stored in Result.narrative: Json
export interface NarrativeResult {
  summary: string
  perceivedPerformance: string
  technicalPerformance: string
  recommendations: string[]
}

// Human-readable severity labels — used by Phase 4 display layer.
export const SEVERITY_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Critical',
}
```

**CATEGORY_LABELS** (new constant, D-02 — not in crawler/types.ts):
```typescript
export const CATEGORY_LABELS: Record<string, string> = {
  'perceived-perf':  'Perceived Performance',
  'technical-perf':  'Technical Performance',
  'accessibility':   'Accessibility',
}
```

**File header comment pattern** (job.ts lines 1-4):
```typescript
// src/types/narrative.ts
// Shared TypeScript types for the Phase 4 display layer.
// NarrativeResult and SEVERITY_LABELS copied from crawler/src/pipeline/types.ts.
// DO NOT import from crawler/ — each sub-project owns its copy (D-01).
```

---

### `src/components/NarrativeSection.tsx` (component, request-response)

**Analog:** `src/components/AnalyzeForm.tsx` (component file structure only — NarrativeSection is a Server Component, not a Client Component)

**File structure pattern** (AnalyzeForm.tsx lines 1-8):
```typescript
// No "use client" for Server Component
import type { NarrativeResult } from '@/types/narrative'
// Named export (not default) — consistent with existing components
export function NarrativeSection({ narrative }: { narrative: NarrativeResult }) { ... }
```

**Tailwind class conventions** (AnalyzeForm.tsx line 66):
```typescript
<p className="text-red-600 mt-2">{error}</p>
// Section equivalent: bg-zinc-100 dark:bg-zinc-900 rounded-lg p-6
```

**Props pattern** — typed inline prop interface, not a separate Props type:
```typescript
// From AnalyzeForm.tsx line 7: function AnalyzeForm() — no props
// NarrativeSection follows same named-export pattern with typed props:
export function NarrativeSection({ narrative }: { narrative: NarrativeResult }) {
```

---

### `src/components/IssueCard.tsx` (component, request-response)

**Analog:** `src/components/AnalyzeForm.tsx` (component file structure only)

**Server Component + typed props pattern**:
```typescript
// No "use client"
import { SeverityBadge } from './SeverityBadge'
import { CATEGORY_LABELS } from '@/types/narrative'
// Issue type from generated Prisma client:
import type { Issue } from '@/generated/prisma'

export function IssueCard({ issue }: { issue: Issue }) {
```

**Mono font convention** (layout.tsx lines 5-8 — Geist Mono available via CSS var):
```typescript
// raw_evidence and signal_source displayed in mono font per UI-SPEC
<code className="font-mono text-sm">{issue.raw_evidence}</code>
// CSS var --font-geist-mono loaded globally in layout.tsx — no import needed
```

---

### `src/components/SeverityBadge.tsx` (component, transform)

**No exact analog** — closest is the inline error display in `src/components/JobStatusBadge.tsx` (lines 34-35) and `AnalyzeForm.tsx` (line 66) for the color-conditional class pattern.

**Color-conditional class pattern** (JobStatusBadge.tsx line 34):
```typescript
{error && <p className="text-red-600">{error}</p>}
// SeverityBadge extends this with a lookup map instead of a ternary:
const SEVERITY_STYLES: Record<number, { bg: string; text: string }> = {
  4: { bg: 'bg-red-600',    text: 'text-white' },   // Critical
  3: { bg: 'bg-orange-600', text: 'text-white' },   // High
  2: { bg: 'bg-yellow-600', text: 'text-black' },   // Medium
  1: { bg: 'bg-green-600',  text: 'text-white' },   // Low
}
```

**Inline prop type pattern** (consistent with all other components):
```typescript
export function SeverityBadge({ severity }: { severity: number }) {
  const { bg, text } = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES[1]
  return (
    <span className={`inline-block rounded-full px-2 py-1 text-sm font-semibold ${bg} ${text}`}>
      {SEVERITY_LABELS[severity as 1 | 2 | 3 | 4]}
    </span>
  )
}
```

---

### `src/components/CausalityGraph.tsx` (Client Component, event-driven)

**Analog:** `src/components/JobStatusBadge.tsx` — exact match (`"use client"`, state, effects, external library integration)

**"use client" + imports pattern** (JobStatusBadge.tsx lines 1-4):
```typescript
'use client'

import { useEffect, useState } from 'react'
import type { JobStatus, JobStatusResponse } from '@/types/job'
// CausalityGraph equivalent:
'use client'
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'
// NOTE: stylesheet imported in globals.css (D-04), NOT here
```

**Named export pattern** (JobStatusBadge.tsx line 6):
```typescript
export function JobStatusBadge({ jobId }: { jobId: string }) {
// CausalityGraph:
export function CausalityGraph({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
```

**Container with explicit pixel height** (required by React Flow):
```typescript
// React Flow collapses to 0 height without an explicit container height (Pitfall 5)
<div className="h-[480px] w-full">
  <ReactFlow nodes={nodes} edges={edges} fitView colorMode="light">
    <Background variant="dots" />
    <Controls />
    <MiniMap />
  </ReactFlow>
</div>
```

---

### `src/components/GraphAbsent.tsx` (component, request-response)

**Analog:** `src/app/(dashboard)/page.tsx` — simple static Server Component

**Static Server Component pattern** (dashboard page.tsx lines 1-10):
```typescript
// No "use client" — pure static display, no interactivity
// Named export
export function GraphAbsent() {
  return (
    <div className="bg-zinc-100 rounded h-[480px] flex items-center justify-center">
      {/* copywriting from UI-SPEC */}
    </div>
  )
}
```

---

### `src/components/ShareButton.tsx` (Client Component, event-driven)

**Analog:** `src/components/JobStatusBadge.tsx` — exact match (`"use client"`, useState, async handler)

**"use client" + state pattern** (JobStatusBadge.tsx lines 1-9):
```typescript
'use client'
import { useEffect, useState } from 'react'
// ShareButton uses only useState (no useEffect needed for copy, only for cleanup)
'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
```

**State + named export** (JobStatusBadge.tsx lines 6-9):
```typescript
export function JobStatusBadge({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<JobStatus>('pending')
  const [error, setError] = useState<string | null>(null)
// ShareButton:
export function ShareButton() {
  const [copied, setCopied] = useState(false)
```

**Async handler pattern** (AnalyzeForm.tsx lines 13-19):
```typescript
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  try { ... } catch { setError('An unexpected error occurred') }
// ShareButton async:
async function handleCopy() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  } catch {
    alert(`Could not copy link. URL: ${window.location.href}`)
  }
}
```

**Error inline display** (AnalyzeForm.tsx line 66):
```typescript
{error && <p className="text-red-600 mt-2">{error}</p>}
```

**Conditional class pattern** (AnalyzeForm.tsx lines 62-65):
```typescript
<button type="submit" disabled={isSubmitting}>
// ShareButton uses copied state to switch classes:
className={`min-h-[44px] px-4 flex items-center gap-2 rounded border ${
  copied
    ? 'bg-blue-600 text-white border-blue-600'
    : 'bg-transparent text-blue-600 border-blue-600'
}`}
```

---

### `src/lib/graph-utils.ts` (utility, transform)

**Analog:** `src/lib/ssrf.ts` — pure utility functions with no framework deps, explicit error handling

**Utility file header pattern** (analyze/route.ts lines 1-9, ssrf.ts naming convention):
```typescript
// src/lib/graph-utils.ts
// Pure utility functions for CausalityGraph data transformation.
// No framework dependencies — safe to import in Server Components and tests.
// Source: 04-CONTEXT.md Specifics (credibility threshold), RESEARCH.md Pattern 3, Pattern 4
```

**Pure function export pattern** (prisma.ts lines 17-23 — named function, not default):
```typescript
// Named exports, no class wrapping
export function meetsCredibilityThreshold(edges: CausalEdge[]): boolean { ... }
export function buildGraphData(issues: Issue[], edges: CausalEdge[]): { nodes: Node[]; edges: Edge[] } { ... }
```

**Type imports from generated Prisma** (route.ts lines 19-22):
```typescript
// API routes import from prisma — same pattern for utility:
import type { Issue, CausalEdge } from '@/generated/prisma'
import type { Node, Edge } from '@xyflow/react'
```

---

### `src/components/JobStatusBadge.tsx` (rewrite, Client Component, event-driven)

**Analog:** `src/components/JobStatusBadge.tsx` (current file — this IS the analog; rewrite preserves structure)

**Current file** (full, 41 lines):
```typescript
'use client'

import { useEffect, useState } from 'react'
import type { JobStatus, JobStatusResponse } from '@/types/job'

export function JobStatusBadge({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<JobStatus>('pending')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)  // REMOVE

  useEffect(() => {
    if (status === 'complete' || status === 'failed') return
    const interval = setInterval(async () => {
      const res = await fetch(`/api/jobs/${jobId}`)
      if (!res.ok) return
      const data: JobStatusResponse = await res.json()
      setStatus(data.status)
      if (data.error_message) setError(data.error_message)

      if (data.status === 'complete') {
        const resultsRes = await fetch(`/api/results/${jobId}`)  // REMOVE
        if (resultsRes.ok) setResult(await resultsRes.json())    // REMOVE
        clearInterval(interval)
      }
      if (data.status === 'failed') clearInterval(interval)
    }, 2000)
    return () => clearInterval(interval)
  }, [jobId, status])

  return (
    <div>
      <span>Status: {status}</span>
      {error && <p className="text-red-600">{error}</p>}
      {result && <pre className="text-sm overflow-auto">...</pre>}  // REMOVE
    </div>
  )
}
```

**What to ADD** (D-03):
```typescript
import { useRouter } from 'next/navigation'
// ...
const router = useRouter()
// Inside the interval, on complete:
if (data.status === 'complete') {
  clearInterval(interval)
  router.push(`/results/${jobId}`)
}
// useEffect dependency array must include router:
}, [jobId, status, router])
```

**What to REMOVE** (D-03):
- `const [result, setResult] = useState<...>` state variable
- `const resultsRes = await fetch('/api/results/${jobId}')` call
- `if (resultsRes.ok) setResult(await resultsRes.json())` assignment
- `{result && <pre>...</pre>}` JSX block

---

### `src/app/globals.css` (edit)

**Analog:** `src/app/globals.css` (current file — append to it)

**Current file** (globals.css lines 1-27, full content):
```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

**Edit: insert after line 1** (D-04, Pitfall 6 — import order matters):
```css
@import "tailwindcss";
@import '@xyflow/react/dist/style.css';   /* ADD THIS — must come after tailwindcss */
```
Import order is critical: Tailwind v4 `@import "tailwindcss"` must precede the React Flow stylesheet so Tailwind's base does not override `.react-flow__*` classes. Confirm visually after install.

---

## Shared Patterns

### Next.js 15 Async Params
**Source:** `src/app/api/results/[jobId]/route.ts` lines 21-23 and `src/app/api/jobs/[jobId]/route.ts` lines 15-17
**Apply to:** `src/app/results/[jobId]/page.tsx`
```typescript
// params is a Promise in Next.js 15 — must await before use
// Both existing API routes demonstrate this pattern
{ params }: { params: Promise<{ jobId: string }> }
const { jobId } = await params
```

### Prisma Import Path
**Source:** `src/lib/prisma.ts` line 12, `src/app/api/analyze/route.ts` line 13
**Apply to:** `src/app/results/[jobId]/page.tsx`, `src/lib/graph-utils.ts`
```typescript
import { prisma } from '@/lib/prisma'
// NOT from '@prisma/client' — generated client is at src/generated/prisma
```

### No "use client" by Default
**Source:** `src/app/(dashboard)/page.tsx` (no directive), `src/app/layout.tsx` (no directive)
**Apply to:** `page.tsx`, `loading.tsx`, `not-found.tsx`, `NarrativeSection.tsx`, `IssueCard.tsx`, `SeverityBadge.tsx`, `GraphAbsent.tsx`
```typescript
// Server Components: omit "use client" entirely
// Client Components: "use client" MUST be the very first line, before all imports
```

### Named Component Exports
**Source:** `src/components/JobStatusBadge.tsx` line 6, `src/components/AnalyzeForm.tsx` line 7
**Apply to:** All new components
```typescript
// Named export (not default) for all components — consistent with existing codebase
export function ComponentName(...) { ... }
// Default export only for Next.js route files (page.tsx, loading.tsx, not-found.tsx)
export default function PageName(...) { ... }
```

### Error Display Pattern
**Source:** `src/components/AnalyzeForm.tsx` line 66, `src/components/JobStatusBadge.tsx` line 35
**Apply to:** `src/components/JobStatusBadge.tsx` (rewrite), inline error section in `page.tsx`
```typescript
{error && <p className="text-red-600">{error}</p>}
// or with mt-2 spacing:
{error && <p className="text-red-600 mt-2">{error}</p>}
```

### Types File Pattern
**Source:** `src/types/job.ts` lines 1-44
**Apply to:** `src/types/narrative.ts`
```typescript
// File: src/types/<name>.ts
// Top comment block: file path, source attribution, phase reference
// JSDoc block above each export
// Types/interfaces exported as named exports
// Constants exported as named const exports with explicit Record<K, V> typing
```

### No Raw SQL / Prisma-Only DB Access
**Source:** `src/app/api/analyze/route.ts` lines 51-65, `src/app/api/results/[jobId]/route.ts` lines 44-47
**Apply to:** `src/app/results/[jobId]/page.tsx`
```typescript
// All DB access via prisma.* — never raw SQL
// Query at the Server Component layer directly — no API hop (per RESEARCH.md anti-patterns)
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/SeverityBadge.tsx` | component (SC) | transform | No badge/pill components exist in codebase yet; closest is inline color conditional in JobStatusBadge line 34 |
| `src/components/GraphAbsent.tsx` | component (SC) | request-response | No placeholder/empty-state components exist; use dashboard page.tsx layout conventions |

---

## Metadata

**Analog search scope:** `src/app/`, `src/components/`, `src/lib/`, `src/types/`, `crawler/src/pipeline/`
**Files scanned:** 13 source files read in full
**Pattern extraction date:** 2026-05-26

**Key analog relationships:**
- `src/app/api/results/[jobId]/route.ts` → `page.tsx` (Prisma query shape, async params, notFound pattern)
- `src/types/job.ts` → `src/types/narrative.ts` (file structure, JSDoc, named exports)
- `src/components/JobStatusBadge.tsx` → `CausalityGraph.tsx`, `ShareButton.tsx` (Client Component conventions)
- `src/components/AnalyzeForm.tsx` → `NarrativeSection.tsx`, `IssueCard.tsx` (component file structure)
- `crawler/src/pipeline/types.ts` → `src/types/narrative.ts` (NarrativeResult + SEVERITY_LABELS to copy verbatim)
- `src/app/globals.css` → `src/app/globals.css` (append @import after line 1)
