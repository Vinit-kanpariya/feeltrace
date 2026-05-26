# Phase 4: Results Dashboard - Research

**Researched:** 2026-05-26
**Domain:** Next.js App Router (Server Components, loading.tsx, not-found.tsx) + React Flow (@xyflow/react) + Tailwind CSS v4
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Create `src/types/narrative.ts` containing `NarrativeResult` interface, `SEVERITY_LABELS` constant, and `CATEGORY_LABELS` constant. These are copied from `crawler/src/pipeline/types.ts` — each sub-project owns its copy; no cross-boundary import.
- **D-02:** `CATEGORY_LABELS` maps: `perceived-perf` → "Perceived Performance", `technical-perf` → "Technical Performance", `accessibility` → "Accessibility". All three display-layer constants live in `src/types/narrative.ts`.
- **D-03:** Clean rewrite of `src/components/JobStatusBadge.tsx`. Remove: `result` state, `/api/results/{jobId}` fetch, `<pre>` JSON dump. Behaviour after rewrite: on `status === 'complete'` → `router.push('/results/${jobId}')`. On `status === 'failed'` → show error message. Status text display stays minimal.
- **D-04:** Add `@import '@xyflow/react/dist/style.css'` to `src/app/globals.css`. Centralised — loaded once globally.
- **D-05:** Missing result (no DB record for the jobId): call Next.js `notFound()` in the Server Component + create `src/app/results/[jobId]/not-found.tsx`. Returns HTTP 404.
- **D-06:** Failed analysis (`job.status === 'failed'` or result has an error_message): render an inline error section in `page.tsx`. Returns HTTP 200.

### Claude's Discretion

None explicitly identified — all major implementation decisions are locked via D-01 through D-06 and the UI-SPEC design contract.

### Deferred Ideas (OUT OF SCOPE)

- Progress step indicator for JobStatusBadge (pending → crawling → extracting → analyzing → complete visual step sequence) — deferred to a later phase.
- Improved homepage status display — out of Phase 4 scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DASH-01 | Dashboard displays a ranked issue list ordered by UX impact severity (Critical first), with per-issue plain-English explanation and signal evidence | Prisma `orderBy: { severity: 'desc' }` at query layer; IssueCard Server Component renders all fields; SEVERITY_LABELS + CATEGORY_LABELS from src/types/narrative.ts |
| DASH-02 | Dashboard displays the plain-English narrative summary prominently as the primary output section | NarrativeSection Server Component renders Result.narrative parsed as NarrativeResult; placed above issue list in page layout |
| DASH-03 | Dashboard renders a causality graph (directed graph) showing technical cause → perceived effect chains using React Flow; only displayed when chain quality meets credibility threshold | CausalityGraph "use client" component using @xyflow/react 12.10.2; GraphAbsent rendered when threshold not met |
| DASH-04 | User can share analysis results via a persistent link or copy the full output to clipboard without requiring an account | ShareButton "use client" component using navigator.clipboard.writeText(window.location.href); route is public (no auth group); Result records have no TTL |
</phase_requirements>

---

## Summary

Phase 4 is a **read-only display layer** built entirely on data Phase 3 already wrote to PostgreSQL. The core engineering challenge is composition: assembling Server Components (NarrativeSection, IssueCard, SeverityBadge, GraphAbsent) with Client Components (CausalityGraph, ShareButton, JobStatusBadge) under Next.js App Router conventions, while correctly placing the React Flow stylesheet import so it loads globally without SSR issues.

The most technically novel piece is the CausalityGraph: React Flow (@xyflow/react 12.10.2) requires a `"use client"` boundary, a container with explicit pixel height, and the stylesheet imported via globals.css rather than inside the component. Node positions must be computed manually (no dagre/layout library required for this MVP scale of 2-6 nodes) before passing to the `<ReactFlow>` component. The graph renders only when all three credibility conditions are met simultaneously; otherwise GraphAbsent replaces it.

The second technically subtle piece is the `notFound()` + HTTP status interaction in Next.js 15 with streaming: when `loading.tsx` is present in the route segment, responses stream at HTTP 200 even when `notFound()` is called — the 404 status is delivered via `<meta name="robots" content="noindex">` instead. This is expected Next.js behavior, not a bug.

**Primary recommendation:** Implement all components as Server Components except the two mandatory Client Components (CausalityGraph, ShareButton). Query Prisma directly in the Server Component — do not route through the existing API route. Follow the UI-SPEC color, spacing, and copywriting contract exactly as locked.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Fetch Result + Issues + CausalEdges | Frontend Server (SSR) | — | Direct Prisma query in Server Component; no need for API hop since data is internal |
| NarrativeSection render | Frontend Server (SSR) | — | Static JSON → HTML; no browser APIs needed |
| IssueCard + SeverityBadge render | Frontend Server (SSR) | — | Static data display; no interactivity |
| CausalityGraph render | Browser / Client | — | React Flow requires browser APIs (ResizeObserver, DOM measurement); `"use client"` required |
| ShareButton clipboard copy | Browser / Client | — | navigator.clipboard is browser-only |
| JobStatusBadge navigation | Browser / Client | — | useRouter requires browser context |
| 404 handling | Frontend Server (SSR) | — | notFound() in Server Component; not-found.tsx in route segment |
| Failed analysis inline error | Frontend Server (SSR) | — | Conditional render in page.tsx Server Component |
| Loading skeleton | Frontend Server (SSR) | — | loading.tsx is a Server Component by default |
| Route: /results/[jobId] | Frontend Server (SSR) | — | Public route outside auth group; no middleware guards |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js (App Router) | 15.5.18 | Route + Server Component framework | Already in project; App Router is the locked convention |
| @xyflow/react | 12.10.2 | Directed causality graph rendering | Explicitly required by DASH-03 and UI-SPEC; MIT license |
| lucide-react | 1.16.0 | Copy + Check icons for ShareButton; ArrowRight for recommendations | Specified by UI-SPEC; zero-config tree-shakeable; ISC license |
| Tailwind CSS | ^4 (v4) | All component styling | Already in project; no shadcn |
| Prisma Client | ^7.8.0 | DB read in Server Component | Already in project; generated client at src/generated/prisma |

[VERIFIED: npm registry] — @xyflow/react 12.10.2 published 2026-03-27, 6.36M weekly downloads, repo: github.com/xyflow/xyflow, postinstall: none
[VERIFIED: npm registry] — lucide-react 1.16.0 published 2026-05-14, 77.4M weekly downloads, repo: github.com/lucide-icons/lucide, postinstall: none

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/navigation | (built-in) | `useRouter` for JobStatusBadge D-03 redirect | Required for client-side router.push in "use client" components |
| next/navigation `notFound` | (built-in) | Trigger 404 from Server Component | D-05: missing Result record |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual node positioning | dagre layout library | Dagre adds a dependency and complexity; with 2-6 nodes max in MVP, a deterministic left-to-right column layout is simpler, fully controllable, and produces identical output |
| `@xyflow/react/dist/style.css` in globals.css | Import in the component file | Component-level import would re-import on each render; globals.css is loaded once and works correctly with Tailwind v4's `@import` pipeline |

**Installation:**
```bash
sfw npm install @xyflow/react lucide-react
```

---

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| @xyflow/react | npm | ~2 yrs (v12 line) | 6.36M/wk | github.com/xyflow/xyflow | N/A — slopcheck unavailable | Approved (manually verified: official xyflow team package, MIT, no postinstall, reactflow.dev homepage) |
| lucide-react | npm | ~4 yrs | 77.4M/wk | github.com/lucide-icons/lucide | N/A — slopcheck unavailable | Approved (manually verified: official Lucide package, ISC, no postinstall) |

**Packages removed due to slopcheck [SLOP] verdict:** none

**Packages flagged as suspicious [SUS]:** none

*slopcheck was unavailable in the Bash path at research time. Both packages were manually verified via official documentation ([CITED: reactflow.dev] and [CITED: npmjs.com/package/lucide-react]), authoritative source repos, high weekly downloads, no postinstall scripts, and established changelogs. Planner may add a checkpoint:human-verify before install if additional assurance is desired.*

---

## Architecture Patterns

### System Architecture Diagram

```
Browser                          Next.js Server (Vercel)              Neon PostgreSQL
  |                                       |                                  |
  | GET /results/{jobId}                  |                                  |
  |-------------------------------------->|                                  |
  |                               page.tsx (Server Component)               |
  |                               prisma.result.findUnique({                |
  |                                 where: { jobId },                       |
  |                                 include: { job, issues, edges }         |
  |                               })------------------------------------->  |
  |                                                                     <result>
  |                                                                         |
  |              [null result] notFound() -> 404 (not-found.tsx)           |
  |              [failed job]  inline error section (D-06)                  |
  |              [complete]    render full page                             |
  |                                  |                                      |
  |         NarrativeSection (SC)    |                                      |
  |         IssueCard x N (SC)       |                                      |
  |         CausalityGraph OR        |                                      |
  |           GraphAbsent (SC/CC)    |                                      |
  |         ShareButton (CC)         |                                      |
  |<---------------------------------|                                      |
  |                                                                         |
  | [user: "Copy share link"]                                               |
  | navigator.clipboard.writeText(window.location.href)                     |
  | [2s success state -> revert]                                            |
```

SC = Server Component, CC = Client Component ("use client")

### Recommended Project Structure

```
src/
├── app/
│   ├── results/
│   │   └── [jobId]/
│   │       ├── page.tsx           # ResultsPage Server Component — Prisma query + layout
│   │       ├── loading.tsx        # Skeleton states for narrative + issue list + graph panel
│   │       └── not-found.tsx      # 404 page — "Results not found" copywriting
│   └── globals.css                # EDIT: add @import '@xyflow/react/dist/style.css'
├── components/
│   ├── NarrativeSection.tsx       # Server Component — renders Result.narrative sections
│   ├── IssueCard.tsx              # Server Component — renders a single Issue record
│   ├── SeverityBadge.tsx          # Server Component — pill badge with severity color
│   ├── CausalityGraph.tsx         # Client Component ("use client") — React Flow canvas
│   ├── GraphAbsent.tsx            # Server Component — placeholder when threshold not met
│   ├── ShareButton.tsx            # Client Component ("use client") — clipboard copy
│   └── JobStatusBadge.tsx         # REWRITE (D-03) — remove result state, add router.push
└── types/
    ├── job.ts                     # Existing — JobStatus, JobStatusResponse, etc.
    └── narrative.ts               # NEW (D-01) — NarrativeResult, SEVERITY_LABELS, CATEGORY_LABELS
```

### Pattern 1: Server Component Direct Prisma Query

**What:** ResultsPage fetches all required data with a single Prisma query including the Job, Issues ordered by severity DESC, and CausalEdges.

**When to use:** Any time all data is needed server-side with no user-specific auth context. Avoids the API route hop.

**Example:**
```typescript
// Source: [CITED: CONTEXT.md code_context + prisma/schema.prisma]
// src/app/results/[jobId]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params  // Next.js 15: params is a Promise

  const result = await prisma.result.findUnique({
    where: { jobId },
    include: {
      job: true,
      issues: { orderBy: { severity: 'desc' } },
      edges: true,
    },
  })

  if (!result) notFound()

  // D-06: inline error for failed job
  if (result.job.status === 'failed' || result.job.error_message) {
    return <AnalysisFailedSection errorMessage={result.job.error_message} />
  }

  const narrative = result.narrative as unknown as NarrativeResult

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* page title + ShareButton */}
      {/* NarrativeSection */}
      {/* IssueCard list */}
      {/* CausalityGraph or GraphAbsent */}
    </main>
  )
}
```

**Critical note:** `prisma.result.findUnique` by `jobId` (not `id`) — the `jobId` field has `@unique` in the schema. Issues must be ordered at query layer (`orderBy: { severity: 'desc' }`) not in JavaScript.

### Pattern 2: NarrativeResult Json Cast

**What:** `Result.narrative` is stored as `Json` in Prisma. Cast to `NarrativeResult` via double-cast through `unknown`.

**When to use:** Any Server Component that reads `Result.narrative`.

**Example:**
```typescript
// Source: [CITED: STATE.md Key Decisions + crawler/src/pipeline/types.ts]
import type { NarrativeResult } from '@/types/narrative'

const narrative = result.narrative as unknown as NarrativeResult
// narrative.summary, narrative.perceivedPerformance, etc. are now typed
```

This pattern is locked from Phase 3 precedent (STATE.md: "NarrativeResult cast via unknown for Prisma Json type — Plain interfaces lack the string index signature InputJsonValue requires; double-cast is safe since NarrativeResult is fully serialisable").

### Pattern 3: React Flow CausalityGraph ("use client")

**What:** CausalityGraph receives pre-computed nodes and edges from the parent Server Component (which passes them as props). The "use client" boundary is only on CausalityGraph — all data transformation happens in the Server Component before being passed down.

**When to use:** Any React Flow component.

**Example:**
```typescript
// Source: [CITED: reactflow.dev/learn/getting-started/building-a-flow]
'use client'
import { ReactFlow, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react'
// Note: stylesheet imported in globals.css, NOT here (D-04)

interface CausalityGraphProps {
  nodes: Node[]
  edges: Edge[]
}

export function CausalityGraph({ nodes, edges }: CausalityGraphProps) {
  return (
    <div className="h-[480px] md:h-[480px] h-[320px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        colorMode="light"
      >
        <Background variant="dots" />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
```

**Node position computation (manual, no dagre):**
```typescript
// Source: [ASSUMED — based on React Flow Node type: position: { x, y } required]
// Compute left-to-right layout from CausalEdge data in the Server Component
// cause nodes: x=0, y=index*120  |  effect nodes: x=300, y=index*120
function buildGraphData(issues: Issue[], edges: CausalEdge[]): { nodes: Node[], edges: Edge[] } {
  const causeIds = new Set(edges.map(e => e.fromIssueId))
  const effectIds = new Set(edges.map(e => e.toIssueId))

  let causeY = 0, effectY = 0
  const nodes: Node[] = issues
    .filter(i => causeIds.has(i.id) || effectIds.has(i.id))
    .map(i => {
      const isCause = causeIds.has(i.id)
      const y = isCause ? (causeY += 120) - 120 : (effectY += 120) - 120
      return {
        id: i.id,
        position: { x: isCause ? 0 : 320, y },
        data: { label: i.category, description: i.technical_description },
        style: {
          background: isCause ? '#fef2f2' : '#fff7ed',
          border: `1px solid ${isCause ? '#dc2626' : '#ea580c'}`,
          color: '#171717',
        },
      }
    })

  const rfEdges: Edge[] = edges.map(e => ({
    id: e.id,
    source: e.fromIssueId,
    target: e.toIssueId,
    label: e.mechanism,
    style: { stroke: '#6b7280' },
  }))

  return { nodes, edges: rfEdges }
}
```

### Pattern 4: Graph Credibility Threshold Check

**What:** ALL three conditions must be simultaneously true. Computed in the Server Component before deciding whether to render CausalityGraph or GraphAbsent.

**Example:**
```typescript
// Source: [CITED: 04-UI-SPEC.md Interaction Contracts]
function meetsCredibilityThreshold(edges: CausalEdge[]): boolean {
  if (edges.length < 2) return false
  if (!edges.some(e => e.confidence === 'high')) return false
  // edges.length >= 1 is already implied by length >= 2
  return true
}
```

### Pattern 5: ShareButton with 2-Second Revert

**What:** Client Component with local state for the 2-second success state. Uses `setTimeout` with `useEffect` cleanup to avoid memory leaks.

**Example:**
```typescript
// Source: [CITED: 04-UI-SPEC.md Interaction Contracts]
'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function ShareButton() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert(`Could not copy link. URL: ${url}`)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`min-h-[44px] px-4 flex items-center gap-2 rounded border ${
        copied
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-transparent text-blue-600 border-blue-600'
      }`}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? 'Link copied' : 'Copy share link'}
    </button>
  )
}
```

### Pattern 6: JobStatusBadge Rewrite (D-03)

**What:** Remove the result state and API fetch. On `status === 'complete'`, call `router.push`. Keep the polling logic and error state.

**Example:**
```typescript
// Source: [CITED: 04-CONTEXT.md D-03]
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { JobStatus, JobStatusResponse } from '@/types/job'

export function JobStatusBadge({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<JobStatus>('pending')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (status === 'complete' || status === 'failed') return
    const interval = setInterval(async () => {
      const res = await fetch(`/api/jobs/${jobId}`)
      if (!res.ok) return
      const data: JobStatusResponse = await res.json()
      setStatus(data.status)
      if (data.error_message) setError(data.error_message)
      if (data.status === 'complete') {
        clearInterval(interval)
        router.push(`/results/${jobId}`)
      }
      if (data.status === 'failed') clearInterval(interval)
    }, 2000)
    return () => clearInterval(interval)
  }, [jobId, status, router])

  return (
    <div>
      <span>Status: {status}</span>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  )
}
```

### Pattern 7: loading.tsx Skeleton with animate-pulse

**What:** loading.tsx is a Server Component co-located in `src/app/results/[jobId]/`. Next.js automatically wraps page.tsx in a Suspense boundary using it.

**Example:**
```typescript
// Source: [CITED: nextjs.org/docs/app/api-reference/file-conventions/loading]
export default function ResultsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      {/* Narrative section skeleton */}
      <div className="bg-zinc-100 rounded p-6 mb-8">
        <div className="h-4 bg-zinc-300 rounded w-3/4 mb-3" />
        <div className="h-4 bg-zinc-300 rounded w-full mb-3" />
        <div className="h-4 bg-zinc-300 rounded w-5/6" />
      </div>
      {/* Issue card skeletons */}
      {[0, 1, 2].map(i => (
        <div key={i} className="bg-zinc-100 rounded p-4 mb-4">
          <div className="h-5 bg-zinc-300 rounded w-16 mb-3" />
          <div className="h-4 bg-zinc-300 rounded w-full mb-2" />
          <div className="h-4 bg-zinc-300 rounded w-4/5" />
        </div>
      ))}
      {/* Graph panel skeleton */}
      <div className="bg-zinc-100 rounded h-[480px] flex items-center justify-center">
        <span className="text-zinc-400">Loading analysis...</span>
      </div>
    </div>
  )
}
```

### Pattern 8: not-found.tsx with Link back to home

**What:** Co-located in `src/app/results/[jobId]/`. Rendered when `notFound()` is called in page.tsx.

```typescript
// Source: [CITED: nextjs.org/docs/app/api-reference/file-conventions/not-found]
import Link from 'next/link'

export default function ResultNotFound() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-semibold">Results not found</h2>
      <p className="mt-4 text-base">
        This analysis link may have expired or never existed.{' '}
        <Link href="/" className="text-blue-600 underline">Return to the home page</Link>{' '}
        to run a new analysis.
      </p>
    </main>
  )
}
```

### Pattern 9: React Flow Stylesheet Global Import (D-04)

**What:** Add the @xyflow/react stylesheet after the Tailwind import in globals.css. This ensures React Flow's internal positioning and edge rendering CSS is loaded globally without duplication.

```css
/* Source: [CITED: reactflow.dev/learn/getting-started/building-a-flow] */
/* src/app/globals.css — add after @import "tailwindcss" */
@import '@xyflow/react/dist/style.css';
```

**Critical:** Without this import, React Flow nodes and edges render as broken/invisible silently — no console error is thrown. This is the most common React Flow integration mistake.

### Anti-Patterns to Avoid

- **Importing React Flow stylesheet inside the component file:** Causes style duplication and potential SSR/hydration mismatches. Always import in globals.css (D-04).
- **Fetching via `/api/results/[jobId]` in the Server Component:** The API route exists from Phase 1 for the old JobStatusBadge JSON dump. The ResultsPage Server Component queries Prisma directly — no API hop needed.
- **Using `result.id` instead of `result.jobId` as the Prisma lookup key:** The `Result` model's unique lookup is by `jobId` field (`@unique`), not by `Result.id`.
- **Sorting issues in JavaScript after fetch:** Sort must be enforced at the Prisma query layer (`orderBy: { severity: 'desc' }`) per CONTEXT.md code_context.
- **Rendering an empty React Flow canvas when threshold is not met:** Renders a confusing empty SVG with no nodes. Use GraphAbsent instead.
- **Using `router.push` from a Server Component:** `useRouter` is only available in Client Components. JobStatusBadge is already `"use client"`.
- **Forgetting `await params` in Next.js 15:** In Next.js 15 App Router, `params` in route handlers and page components is a `Promise` — must be awaited. The existing API route at `src/app/api/results/[jobId]/route.ts` already demonstrates this pattern correctly.
- **Passing non-serializable data across the Server/Client boundary:** Only plain JSON-serializable props can cross the Server→Client boundary. Pass `nodes: Node[]` and `edges: Edge[]` (plain objects) to CausalityGraph, not Prisma model instances.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Directed graph visualization | Custom SVG with foreignObject nodes, manual edge routing | `@xyflow/react` | Edge routing, pan/zoom, minimap, Controls — each is a substantial engineering problem; React Flow solves all of them |
| Copy-to-clipboard with browser compatibility | Custom execCommand fallback, permission prompts | `navigator.clipboard.writeText()` with try/catch | Modern browsers support it; the try/catch already handles denial gracefully per UI-SPEC |
| Loading skeleton | Custom spinner, third-party loading library | Tailwind `animate-pulse` + `loading.tsx` | Zero-dependency; Next.js automatically wraps in Suspense |
| Node layout algorithm | Manual coordinate math for complex graphs | Pass fixed positions for MVP (2-6 nodes max) | At MVP scale with 2 "columns" (cause/effect), manual positioning is simpler and more predictable than dagre |
| Icon components | Custom SVG icons | `lucide-react` | Already locked by UI-SPEC; tree-shakeable; consistent stroke width |

**Key insight:** The only graph library call in this phase is `<ReactFlow nodes={...} edges={...}>` — do not build any graph infrastructure from scratch.

---

## Runtime State Inventory

> Omitted — this is a greenfield UI phase, not a rename/refactor/migration phase. No runtime state rename required.

---

## Common Pitfalls

### Pitfall 1: React Flow Stylesheet Not Imported

**What goes wrong:** Nodes appear but edges don't render; node dragging is broken; minimap has no background. No browser console error — silent failure.

**Why it happens:** React Flow's internal CSS handles `position: absolute` on nodes and edge SVG layering. Without it the layout collapses.

**How to avoid:** Add `@import '@xyflow/react/dist/style.css'` to `src/app/globals.css` before any other custom overrides (D-04 is locked). Verify the import is present before starting any React Flow work.

**Warning signs:** Nodes render as text blocks stacked vertically; edges are invisible.

### Pitfall 2: Next.js 15 `params` is a Promise

**What goes wrong:** `params.jobId` is `undefined` — the TypeScript types won't catch this at compile time in some versions.

**Why it happens:** Next.js 15 made `params` async. Direct property access on the un-awaited Promise silently returns `undefined`.

**How to avoid:** Always `const { jobId } = await params` before using. The existing API route at `src/app/api/results/[jobId]/route.ts` demonstrates the correct pattern already.

**Warning signs:** `notFound()` triggered for a known-valid jobId; Prisma query returns null unexpectedly.

### Pitfall 3: HTTP Status with Streaming (loading.tsx present)

**What goes wrong:** You expect `notFound()` to return HTTP 404 but the client receives HTTP 200 when `loading.tsx` is in the same route segment.

**Why it happens:** When `loading.tsx` causes streaming to begin, response headers are already sent before `notFound()` is evaluated. Next.js signals the 404 via `<meta name="robots" content="noindex">` in the streamed HTML instead.

**How to avoid:** This is expected behavior per Next.js docs — not a bug. The `not-found.tsx` component still renders correctly for the user; only the HTTP status code differs. For SEO purposes, the noindex meta tag prevents search engines from indexing the 404.

**Warning signs:** Network tab shows 200 for a not-found result; this is correct.

### Pitfall 4: Passing Prisma Model Instances Across Server/Client Boundary

**What goes wrong:** `Error: Only plain objects can be passed to Client Components from Server Components. Prisma model instances are not supported.`

**Why it happens:** Prisma models include non-serializable internals. React requires plain JSON-serializable values to cross the boundary.

**How to avoid:** Compute `nodes: Node[]` and `edges: Edge[]` (plain objects) in the Server Component, then pass as props to CausalityGraph. Never pass a Prisma `CausalEdge` or `Issue` instance directly to a Client Component.

**Warning signs:** Next.js throws a serialization error at runtime; page fails to hydrate.

### Pitfall 5: React Flow Container Requires Explicit Height

**What goes wrong:** React Flow canvas renders as a 0-height element — nothing visible.

**Why it happens:** ReactFlow uses 100% height of its container. If the container has no explicit height, it collapses to 0.

**How to avoid:** Always wrap ReactFlow in a div with explicit pixel height: `className="h-[480px] w-full"` (desktop) per UI-SPEC.

**Warning signs:** Empty white area where graph should be; no error thrown.

### Pitfall 6: Tailwind v4 and Third-Party CSS Import Order

**What goes wrong:** React Flow's CSS classes (e.g., `.react-flow__node`) are overridden by Tailwind's reset or vice versa.

**Why it happens:** In Tailwind v4, `@import "tailwindcss"` must come before any third-party stylesheet imports to ensure Tailwind's base doesn't override custom library styles.

**How to avoid:** Import order in globals.css: (1) `@import "tailwindcss"`, (2) `@import '@xyflow/react/dist/style.css'`, (3) any custom rules.

**Warning signs:** React Flow edges appear with wrong stroke width; node borders override severity colors.

### Pitfall 7: `result.findUnique` lookup via jobId not result.id

**What goes wrong:** `prisma.result.findUnique({ where: { id: jobId } })` returns null because `jobId` is not the `Result.id` — it is the `Job.id` stored in `Result.jobId`.

**Why it happens:** The route param is `[jobId]` — the `Job.id`, not the `Result.id`. The Result model has `jobId @unique`, so the correct lookup is `where: { jobId }`.

**How to avoid:** Use `prisma.result.findUnique({ where: { jobId } })` — not `{ where: { id: jobId } }`.

---

## Code Examples

### NarrativeSection (Server Component)

```typescript
// Source: [CITED: 04-UI-SPEC.md NarrativeSection + 04-CONTEXT.md D-01]
import { ArrowRight } from 'lucide-react'
import type { NarrativeResult } from '@/types/narrative'

export function NarrativeSection({ narrative }: { narrative: NarrativeResult }) {
  return (
    <section className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">What users experience</h2>
      <div className="mb-4">
        <p className="text-sm text-zinc-500 mb-1">Overview</p>
        <p className="text-base leading-relaxed">{narrative.summary}</p>
      </div>
      <div className="mb-4">
        <p className="text-sm text-zinc-500 mb-1">How it feels</p>
        <p className="text-base leading-relaxed">{narrative.perceivedPerformance}</p>
      </div>
      <div className="mb-4">
        <p className="text-sm text-zinc-500 mb-1">What the data says</p>
        <p className="text-base leading-relaxed">{narrative.technicalPerformance}</p>
      </div>
      <div>
        <p className="text-sm text-zinc-500 mb-2">Recommended actions</p>
        <ul className="space-y-2">
          {narrative.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-base leading-relaxed">
              <ArrowRight size={14} className="text-blue-600 mt-1 shrink-0" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
```

### SeverityBadge (Server Component)

```typescript
// Source: [CITED: 04-UI-SPEC.md SeverityBadge + Severity Color Mapping]
import { SEVERITY_LABELS } from '@/types/narrative'

const SEVERITY_STYLES: Record<number, { bg: string; text: string }> = {
  4: { bg: 'bg-red-600',    text: 'text-white' },   // Critical
  3: { bg: 'bg-orange-600', text: 'text-white' },   // High
  2: { bg: 'bg-yellow-600', text: 'text-black' },   // Medium
  1: { bg: 'bg-green-600',  text: 'text-white' },   // Low
}

export function SeverityBadge({ severity }: { severity: number }) {
  const { bg, text } = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES[1]
  return (
    <span className={`inline-block rounded-full px-2 py-1 text-sm font-semibold ${bg} ${text}`}>
      {SEVERITY_LABELS[severity as 1 | 2 | 3 | 4]}
    </span>
  )
}
```

### src/types/narrative.ts (D-01, D-02)

```typescript
// Source: [CITED: 04-CONTEXT.md D-01, D-02; crawler/src/pipeline/types.ts]
// Copied from crawler/src/pipeline/types.ts — owned by each sub-project separately.
// DO NOT import from crawler/ — each sub-project owns its copy.

export interface NarrativeResult {
  summary: string
  perceivedPerformance: string
  technicalPerformance: string
  recommendations: string[]
}

export const SEVERITY_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Critical',
}

export const CATEGORY_LABELS: Record<string, string> = {
  'perceived-perf':  'Perceived Performance',
  'technical-perf':  'Technical Performance',
  'accessibility':   'Accessibility',
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `reactflow` package | `@xyflow/react` package | React Flow v12 (2024) | Package rename; `import { ReactFlow } from '@xyflow/react'` — NOT `from 'reactflow'` |
| `parentNode` prop on nodes | `parentId` prop | React Flow v12 | Breaking rename; using `parentNode` silently does nothing |
| Direct width/height reads on node | `node.measured.width`, `node.measured.height` | React Flow v12 | Explicit dimensions now optional — library measures them internally |
| `onEdgeUpdate` | `onReconnect` | React Flow v12 | Relevant only for editable graphs; read-only graph in Phase 4 is unaffected |
| Next.js 14 `params` as plain object | Next.js 15 `params` as `Promise` | Next.js 15.0 | `await params` required before accessing jobId |

**Deprecated/outdated:**
- `reactflow` npm package: Do NOT use — the package was renamed to `@xyflow/react` as of v12. The old package may still exist on npm but receives no updates.
- `pages/` Router patterns: This project uses App Router exclusively. No `getServerSideProps`, no `getStaticProps`.

---

## Project Constraints (from CLAUDE.md)

| Constraint | Directive |
|------------|-----------|
| Package installs | ALWAYS prefix with `sfw`: `sfw npm install @xyflow/react lucide-react` |
| Router | App Router only — no Pages Router |
| Server Components default | `"use client"` only when required (CausalityGraph, ShareButton, JobStatusBadge) |
| DB access | Prisma only — no raw SQL |
| Event names | snake_case (not relevant to display layer) |
| Experience score | float 0.0–10.0 (not used in Phase 4) |
| API routes | `src/app/api/` — REST conventions |
| Env vars | `NEXT_PUBLIC_` prefix for public; secrets never on client |
| Tracker boundary | Never import from `tracker/` or `crawler/` in `src/` |
| Generated files | Never edit `tracker/dist/` or `prisma/migrations/` |

---

## Open Questions

1. **Tailwind v4 `@import` order with React Flow CSS**
   - What we know: Tailwind v4 uses `@import "tailwindcss"` and processes CSS via PostCSS. Adding `@import '@xyflow/react/dist/style.css'` after the Tailwind import should be safe.
   - What's unclear: Whether Tailwind v4's JIT/scan may strip or override React Flow's `.react-flow__*` classes since they don't appear in any source file.
   - Recommendation: Add the import and verify visually during Wave 1. If React Flow CSS conflicts with Tailwind preflight, add `@layer` guards. No evidence of incompatibility found.

2. **`notFound()` placement before async Prisma call**
   - What we know: Per Next.js docs, calling `notFound()` after streaming has begun (i.e., after the first `await`) results in HTTP 200 with noindex meta, not a true 404.
   - What's unclear: Whether the Vercel/Next.js 15.5 deployment configuration has any special handling.
   - Recommendation: Accept HTTP 200 behavior as documented; the UI still renders not-found.tsx correctly. If strict 404 HTTP status is needed, use a `proxy` file per Next.js docs — not needed for Phase 4 MVP.

3. **Dark mode color handling for severity badges**
   - What we know: UI-SPEC provides both light and dark values for severity badge backgrounds (e.g., Critical: `#fef2f2` light / `#7f1d1d` dark). The existing globals.css uses `prefers-color-scheme: dark` with CSS vars.
   - What's unclear: Whether implementing dark variants is in Phase 4 scope — the UI-SPEC documents them but the CONTEXT.md does not explicitly require them.
   - Recommendation: Implement light mode only for Phase 4 MVP using the light values from UI-SPEC. Document dark mode as a follow-up. The CONTEXT.md does not list dark mode as a locked decision.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js build + Prisma | ✓ | (project already running) | — |
| PostgreSQL (Neon) | Prisma ResultsPage query | ✓ | Neon serverless | — |
| Prisma generated client | `src/lib/prisma.ts` import | ✓ | `src/generated/prisma/` present | Run `npm run db:push` |
| @xyflow/react | CausalityGraph | ✗ (not yet installed) | 12.10.2 on npm | — (required, no fallback) |
| lucide-react | ShareButton icons, ArrowRight | ✗ (not yet installed) | 1.16.0 on npm | — (required, no fallback) |

**Missing dependencies with no fallback:**
- `@xyflow/react` — must install before CausalityGraph can be implemented
- `lucide-react` — must install before ShareButton and NarrativeSection recommendations list

**Missing dependencies with fallback:**
- None

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.7 |
| Config file | `vitest.config.mts` (project root) |
| Quick run command | `npm run test:run` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | Issues ordered by severity DESC | unit | `npm run test:run -- src/app/results` | ❌ Wave 0 |
| DASH-01 | SEVERITY_LABELS maps 1→"Low", 4→"Critical" | unit | `npm run test:run -- src/types/narrative.test.ts` | ❌ Wave 0 |
| DASH-01 | CATEGORY_LABELS maps all 3 keys correctly | unit | `npm run test:run -- src/types/narrative.test.ts` | ❌ Wave 0 |
| DASH-02 | NarrativeSection renders all 4 sub-sections | unit (React Testing Library) | `npm run test:run -- src/components/NarrativeSection.test.tsx` | ❌ Wave 0 |
| DASH-03 | meetsCredibilityThreshold: correct for all threshold cases | unit | `npm run test:run -- src/lib/graph-utils.test.ts` | ❌ Wave 0 |
| DASH-03 | buildGraphData produces correct node/edge positions | unit | `npm run test:run -- src/lib/graph-utils.test.ts` | ❌ Wave 0 |
| DASH-04 | ShareButton: clipboard write called with correct URL | unit (jsdom + vi.fn) | `npm run test:run -- src/components/ShareButton.test.tsx` | ❌ Wave 0 |
| D-03 | JobStatusBadge: router.push called on complete | unit | `npm run test:run -- src/components/JobStatusBadge.test.tsx` | ❌ Wave 0 |
| DASH-01/02/03 | Smoke test: real Result record from DB renders without crash | manual | visit `/results/cmpmjx5xo0000rcjd0nxrvh5g` in browser | — |

### Sampling Rate

- **Per task commit:** `npm run test:run`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green + manual smoke test before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/types/narrative.test.ts` — covers SEVERITY_LABELS and CATEGORY_LABELS constant correctness
- [ ] `src/lib/graph-utils.test.ts` (or `src/components/CausalityGraph.test.ts`) — covers `meetsCredibilityThreshold` and `buildGraphData`
- [ ] `src/components/ShareButton.test.tsx` — covers clipboard API call and 2s revert logic
- [ ] `src/components/JobStatusBadge.test.tsx` — covers router.push on complete status (update existing test if present)
- [ ] `src/components/NarrativeSection.test.tsx` — covers rendering all 4 NarrativeResult sections

Note: `vitest.config.mts` `include` pattern covers `src/**/*.test.ts` and `crawler/src/**/*.test.ts`. New test files with `.test.tsx` extension may need the include pattern updated to `src/**/*.test.{ts,tsx}`.

---

## Security Domain

Phase 4 is a **read-only display layer** with no auth, no form submission, no data writes, and no user input other than the clipboard copy. ASVS categories are limited.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Route is intentionally public (DASH-04) |
| V3 Session Management | no | No sessions in Phase 4 |
| V4 Access Control | minimal | Route is public by design; no sensitive data gating needed beyond what Phase 1 auth middleware already handles |
| V5 Input Validation | minimal | `jobId` from URL params is passed directly to Prisma `findUnique` — Prisma parameterizes it; no injection risk |
| V6 Cryptography | no | No secrets, no encryption in display layer |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Enumerate valid jobIds via brute force | Information Disclosure | CUIDs are cryptographically unguessable (not sequential); no additional rate limiting needed for read-only display |
| XSS via Result.narrative content | Tampering | React JSX auto-escapes all string interpolation; never use `dangerouslySetInnerHTML` |
| Open redirect via crafted jobId | Elevation of Privilege | JobStatusBadge uses `router.push('/results/${jobId}')` — jobId comes from the DB, not user input at this point |

---

## Sources

### Primary (HIGH confidence)

- [CITED: nextjs.org/docs/app/api-reference/file-conventions/not-found] — not-found.tsx behavior, notFound() function, HTTP status nuance with streaming
- [CITED: nextjs.org/docs/app/api-reference/file-conventions/loading] — loading.tsx wraps page.tsx in Suspense automatically, Server Component by default
- [CITED: reactflow.dev/learn/getting-started/building-a-flow] — stylesheet import path (`@xyflow/react/dist/style.css`), Node/Edge type requirements, container height requirement
- [CITED: reactflow.dev/learn/troubleshooting/migrate-to-v12] — v12 package rename to `@xyflow/react`, `parentNode`→`parentId`, measured dimensions API
- [CITED: reactflow.dev/learn/layouting/layouting] — layout library options (dagre, d3-hierarchy, elk); manual positioning is valid for small graphs
- [CITED: reactflow.dev/api-reference/react-flow] — Background, Controls, MiniMap sub-components; event handler list
- [CITED: 04-CONTEXT.md] — all locked decisions D-01 through D-06
- [CITED: 04-UI-SPEC.md] — all component contracts, color values, spacing, copywriting, credibility threshold logic
- [CITED: crawler/src/pipeline/types.ts] — NarrativeResult interface, SEVERITY_LABELS, PERMITTED_MECHANISMS (source of truth for copy)
- [CITED: prisma/schema.prisma] — Result.jobId @unique, Issue.severity Int, CausalEdge.confidence String, CausalEdge.mechanism non-nullable
- [CITED: STATE.md Key Decisions] — NarrativeResult double-cast via unknown, causal edge index remap context, smoke test record ID

### Secondary (MEDIUM confidence)

- [VERIFIED: npm registry] — @xyflow/react 12.10.2, published 2026-03-27, no postinstall
- [VERIFIED: npm registry] — lucide-react 1.16.0, published 2026-05-14, no postinstall
- WebSearch results confirming `@xyflow/react/dist/style.css` as the correct import path for v12

### Tertiary (LOW confidence)

- None

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Manual left-to-right node layout (cause nodes x=0, effect nodes x=320, y=index*120) produces a legible graph for 2-6 nodes | Code Examples, Pattern 3 | Graph nodes may overlap if multiple issues share the same cause/effect role at the same index; fix by adjusting y-spacing or adding dagre |
| A2 | `vitest.config.mts` include pattern `src/**/*.test.ts` needs updating to `src/**/*.test.{ts,tsx}` for React component tests | Validation Architecture Wave 0 Gaps | `.test.tsx` files won't be picked up; tests appear to pass because they're simply not run |

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all packages verified on npm registry with official documentation
- Architecture patterns: HIGH — all patterns traced to official Next.js docs, React Flow docs, or locked decisions in CONTEXT.md/UI-SPEC
- Pitfalls: HIGH — each pitfall is grounded in a specific documented behavior (Next.js 15 async params, React Flow stylesheet silent failure, streaming HTTP status)
- Test framework: HIGH — vitest.config.mts present in repo, pattern established in Phase 1/2/3

**Research date:** 2026-05-26
**Valid until:** 2026-07-26 (stable Next.js 15 + React Flow 12 APIs — 60 days)
