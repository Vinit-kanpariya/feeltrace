# Results Page UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the screenshot proxy SSRF guard, make the "How to Fix" callout visible and distinct in issue cards, and apply visual polish across the results page components.

**Architecture:** Pure component and route changes — no schema, no new dependencies. The SSRF guard gets a regex replacing the broken prefix check. IssueCard gets a new internal layout with a clearly-labelled evidence block and a green callout box for `fix_suggestion`. All cards and the page background get updated colour tokens from the ui-ux-pro-max design system (dark OLED + data-dense hybrid).

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, Vitest + @testing-library/react (jsdom), Lucide icons, Prisma (read-only in components).

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/app/api/screenshot/[jobId]/route.ts` | Modify | Export `isAllowedBlobUrl`, replace prefix check with regex |
| `src/app/api/screenshot/[jobId]/route.test.ts` | Create | Unit-test the URL validation function |
| `src/components/IssueCard.tsx` | Modify | New layout: top bar, evidence block, green fix callout |
| `src/components/IssueCard.test.tsx` | Create | Test fix callout present/absent behavior |
| `src/components/NarrativeSection.tsx` | Modify | Two-column label+text layout |
| `src/components/ScreenshotPreview.tsx` | Modify | Chrome bar colour tweak |
| `src/components/ShareButton.tsx` | Modify | Ghost button style (default state) |
| `src/app/results/[jobId]/page.tsx` | Modify | Eyebrow label, subtitle, darker page background |
| `src/app/(dashboard)/page.tsx` | Modify | Darker page background only |

---

## Task 1: Fix the screenshot proxy SSRF guard

**Files:**
- Modify: `src/app/api/screenshot/[jobId]/route.ts`
- Create: `src/app/api/screenshot/[jobId]/route.test.ts`

The current guard checks `result.screenshot_url.startsWith('https://blob.vercel-storage.com/')` which never matches real Vercel Blob public URLs (`https://<store-id>.public.blob.vercel-storage.com/...`). The fix exports a testable `isAllowedBlobUrl` function and replaces the string check with a regex.

- [ ] **Step 1.1: Write the failing tests**

Create `src/app/api/screenshot/[jobId]/route.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { isAllowedBlobUrl } from './route'

describe('isAllowedBlobUrl', () => {
  it('accepts a public-subdomain Vercel Blob URL', () => {
    expect(
      isAllowedBlobUrl('https://abc123xyz.public.blob.vercel-storage.com/screenshots/shot.jpg')
    ).toBe(true)
  })

  it('accepts a hyphenated store-id Vercel Blob URL', () => {
    expect(
      isAllowedBlobUrl('https://my-store-01.public.blob.vercel-storage.com/file.png')
    ).toBe(true)
  })

  it('accepts the legacy top-level blob.vercel-storage.com URL', () => {
    expect(
      isAllowedBlobUrl('https://blob.vercel-storage.com/file.jpg')
    ).toBe(true)
  })

  it('rejects an arbitrary HTTPS URL', () => {
    expect(isAllowedBlobUrl('https://evil.com/steal.jpg')).toBe(false)
  })

  it('rejects a URL that only contains the domain as a path segment', () => {
    expect(
      isAllowedBlobUrl('https://evil.com/blob.vercel-storage.com/file.jpg')
    ).toBe(false)
  })

  it('rejects a blob subdomain that is not a Vercel Blob store', () => {
    expect(
      isAllowedBlobUrl('https://evil.blob.evil.com/file.jpg')
    ).toBe(false)
  })
})
```

- [ ] **Step 1.2: Run tests to confirm they fail**

```bash
npm test -- src/app/api/screenshot
```

Expected: 6 failures — `isAllowedBlobUrl is not a function` (not exported yet).

- [ ] **Step 1.3: Export `isAllowedBlobUrl` and update the guard**

Replace the entire content of `src/app/api/screenshot/[jobId]/route.ts` with:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Vercel Blob public URL patterns this proxy accepts:
 *   https://<store-id>.public.blob.vercel-storage.com/<path>
 *   https://blob.vercel-storage.com/<path>   (legacy / private)
 *
 * Exported for unit testing.
 */
export const VERCEL_BLOB_RE =
  /^https:\/\/(?:[a-zA-Z0-9-]+\.public\.blob|blob)\.vercel-storage\.com\//

export function isAllowedBlobUrl(url: string): boolean {
  return VERCEL_BLOB_RE.test(url)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params

  const result = await prisma.result.findUnique({
    where: { jobId },
    select: { screenshot_url: true },
  })

  if (!result?.screenshot_url) {
    return new NextResponse(null, { status: 404 })
  }

  if (!isAllowedBlobUrl(result.screenshot_url)) {
    return new NextResponse(null, { status: 400 })
  }

  const blobRes = await fetch(result.screenshot_url)

  if (!blobRes.ok) {
    return new NextResponse(null, { status: blobRes.status })
  }

  return new NextResponse(blobRes.body, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
```

- [ ] **Step 1.4: Run tests to confirm they pass**

```bash
npm test -- src/app/api/screenshot
```

Expected: 6 passing.

- [ ] **Step 1.5: Commit**

```bash
git add src/app/api/screenshot/[jobId]/route.ts src/app/api/screenshot/[jobId]/route.test.ts
git commit -m "fix: update SSRF guard regex to accept Vercel Blob public subdomain URLs"
```

---

## Task 2: Redesign IssueCard with evidence block + fix callout

**Files:**
- Modify: `src/components/IssueCard.tsx`
- Create: `src/components/IssueCard.test.tsx`

The card gets a 3px coloured top bar (replacing the inline `borderLeft`), an `EVIDENCE` sub-block containing `raw_evidence` + optional `severity_justification`, and a green `HOW TO FIX` callout when `fix_suggestion` is non-empty.

- [ ] **Step 2.1: Write the failing tests**

Create `src/components/IssueCard.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IssueCard } from './IssueCard'

const base = {
  id: 'i1',
  category: 'performance',
  signal_source: 'network HAR',
  severity: 4,
  raw_evidence: 'LCP 4.8s on mobile',
  technical_description: 'Render-blocking stylesheet delays FMP',
  fix_suggestion: '',
  severity_justification: '',
}

describe('IssueCard', () => {
  it('renders the technical description', () => {
    render(<IssueCard issue={base} />)
    expect(screen.getByText('Render-blocking stylesheet delays FMP')).toBeDefined()
  })

  it('renders the raw evidence text', () => {
    render(<IssueCard issue={base} />)
    expect(screen.getByText('LCP 4.8s on mobile')).toBeDefined()
  })

  it('renders the signal source', () => {
    render(<IssueCard issue={base} />)
    expect(screen.getByText('network HAR')).toBeDefined()
  })

  it('does not render the fix callout when fix_suggestion is empty string', () => {
    render(<IssueCard issue={{ ...base, fix_suggestion: '' }} />)
    expect(screen.queryByText('How to fix')).toBeNull()
  })

  it('does not render the fix callout when fix_suggestion is absent', () => {
    const { fix_suggestion: _f, ...noFix } = base
    render(<IssueCard issue={noFix} />)
    expect(screen.queryByText('How to fix')).toBeNull()
  })

  it('renders the fix callout label when fix_suggestion is present', () => {
    render(<IssueCard issue={{ ...base, fix_suggestion: 'Add preload hint to stylesheet' }} />)
    expect(screen.getByText('How to fix')).toBeDefined()
  })

  it('renders the fix_suggestion text inside the callout', () => {
    render(<IssueCard issue={{ ...base, fix_suggestion: 'Add preload hint to stylesheet' }} />)
    expect(screen.getByText('Add preload hint to stylesheet')).toBeDefined()
  })

  it('renders severity_justification inside the evidence block when present', () => {
    render(<IssueCard issue={{ ...base, severity_justification: 'Impacts 60% of mobile users' }} />)
    expect(screen.getByText('Impacts 60% of mobile users')).toBeDefined()
  })

  it('does not render severity_justification row when it is empty', () => {
    render(<IssueCard issue={{ ...base, severity_justification: '' }} />)
    expect(screen.queryByText('Impacts 60% of mobile users')).toBeNull()
  })
})
```

- [ ] **Step 2.2: Run tests to confirm they fail**

```bash
npm test -- src/components/IssueCard.test
```

Expected: failures on the `How to fix` tests — the current component doesn't render that label.

- [ ] **Step 2.3: Rewrite IssueCard.tsx**

Replace the entire file `src/components/IssueCard.tsx`:

```typescript
import { SeverityBadge } from './SeverityBadge'
import { CATEGORY_LABELS } from '@/types/narrative'

const SEVERITY_ACCENT: Record<number, string> = {
  4: '#ef4444',
  3: '#f97316',
  2: '#eab308',
  1: '#22c55e',
}

interface IssueCardProps {
  issue: {
    id: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
  }
}

export function IssueCard({ issue }: IssueCardProps) {
  const accent = SEVERITY_ACCENT[issue.severity] ?? SEVERITY_ACCENT[1]

  return (
    <div className="rounded-[10px] bg-[#131f35] border border-white/[0.07] overflow-hidden mb-[10px] transition-colors duration-200 hover:bg-[#172240] hover:border-white/[0.13]">
      {/* 3px severity top bar */}
      <div style={{ height: '3px', background: accent }} aria-hidden="true" />

      <div className="p-4">
        {/* Meta row: badge + category left, signal tag right */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <SeverityBadge severity={issue.severity} />
            <span className="text-[11px] font-medium text-[#475569]">
              {CATEGORY_LABELS[issue.category] ?? issue.category}
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#334155] bg-black/30 px-[7px] py-[2px] rounded">
            {issue.signal_source}
          </span>
        </div>

        {/* Description */}
        <p className="text-[13px] text-slate-200 leading-[1.65] mb-3">
          {issue.technical_description}
        </p>

        {/* Evidence block */}
        <div className="rounded-lg bg-black/35 border border-white/[0.05] px-3 py-2.5 mb-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#1e3a5f] mb-1.5">
            Evidence
          </p>
          <p className="text-[11px] font-mono text-[#64748b] leading-[1.7]">
            <span className="text-[#1e3a5f] select-none">evidence  </span>
            {issue.raw_evidence}
          </p>
          {issue.severity_justification && (
            <p className="text-[11px] font-mono text-[#64748b] leading-[1.7]">
              <span className="text-[#1e3a5f] select-none">impact    </span>
              {issue.severity_justification}
            </p>
          )}
        </div>

        {/* How to fix callout — rendered only when fix_suggestion is non-empty */}
        {issue.fix_suggestion && (
          <div
            className="rounded-lg px-3 py-2.5 flex gap-2.5"
            style={{
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.18)',
            }}
          >
            <div
              className="w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: 'rgba(34,197,94,0.12)' }}
              aria-hidden="true"
            >
              <svg
                className="w-[11px] h-[11px] text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#16a34a] mb-1">
                How to fix
              </p>
              <p className="text-[12px] leading-[1.65]" style={{ color: '#86efac' }}>
                {issue.fix_suggestion}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2.4: Run tests to confirm they pass**

```bash
npm test -- src/components/IssueCard.test
```

Expected: 9 passing.

- [ ] **Step 2.5: Commit**

```bash
git add src/components/IssueCard.tsx src/components/IssueCard.test.tsx
git commit -m "feat: redesign IssueCard — evidence block, green How to Fix callout, top-bar severity"
```

---

## Task 3: Update NarrativeSection to two-column layout

**Files:**
- Modify: `src/components/NarrativeSection.tsx`

Layout changes only — the same text content, just structured as a fixed-width label column beside the text column. The existing tests in `NarrativeSection.test.tsx` all check text content, so they must continue passing without modification.

- [ ] **Step 3.1: Run existing tests to confirm current baseline**

```bash
npm test -- src/components/NarrativeSection
```

Expected: 8 passing. If any fail, stop and investigate before continuing.

- [ ] **Step 3.2: Rewrite NarrativeSection.tsx**

Replace the entire file `src/components/NarrativeSection.tsx`:

```typescript
import { ArrowRight } from 'lucide-react'
import type { NarrativeResult } from '@/types/narrative'

export function NarrativeSection({ narrative }: { narrative: NarrativeResult }) {
  return (
    <section className="rounded-xl bg-[#131f35] border border-white/[0.08] overflow-hidden">
      {/* Header with green accent dot */}
      <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center gap-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" aria-hidden="true" />
        <h2 className="text-[13px] font-semibold text-slate-200">What users experience</h2>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Overview */}
        <div className="flex gap-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#334155] shrink-0 whitespace-nowrap w-[90px] mt-0.5">
            Overview
          </span>
          <p className="text-[13px] text-[#94a3b8] leading-[1.65]">{narrative.summary}</p>
        </div>

        <div className="h-px bg-white/[0.05]" />

        {/* How it feels */}
        <div className="flex gap-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#334155] shrink-0 whitespace-nowrap w-[90px] mt-0.5">
            How it feels
          </span>
          <p className="text-[13px] text-[#94a3b8] leading-[1.65]">{narrative.perceivedPerformance}</p>
        </div>

        <div className="h-px bg-white/[0.05]" />

        {/* What the data says */}
        <div className="flex gap-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#334155] shrink-0 whitespace-nowrap w-[90px] mt-0.5">
            What the data says
          </span>
          <p className="text-[13px] text-[#94a3b8] leading-[1.65]">{narrative.technicalPerformance}</p>
        </div>

        <div className="h-px bg-white/[0.05]" />

        {/* Recommended actions */}
        <div className="flex gap-4 items-start">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#334155] shrink-0 whitespace-nowrap w-[90px] mt-0.5">
            Recommended actions
          </span>
          <ul className="space-y-2 flex-1">
            {narrative.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <ArrowRight size={12} className="text-green-400 mt-0.5 shrink-0" aria-hidden="true" />
                <span className="text-[13px] text-[#94a3b8] leading-[1.65]">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3.3: Run existing tests to confirm they still pass**

```bash
npm test -- src/components/NarrativeSection
```

Expected: 8 passing (same as baseline — no test changes needed).

- [ ] **Step 3.4: Commit**

```bash
git add src/components/NarrativeSection.tsx
git commit -m "feat: refactor NarrativeSection to two-column label+text layout"
```

---

## Task 4: Polish ScreenshotPreview chrome bar

**Files:**
- Modify: `src/components/ScreenshotPreview.tsx`

Pure styling change — no logic, no tests needed. The chrome bar goes from `bg-slate-800/50` to a slightly lighter `bg-[#1b2336]` to make it visually distinct from the card body.

- [ ] **Step 4.1: Update ScreenshotPreview.tsx**

Replace the entire file `src/components/ScreenshotPreview.tsx`:

```typescript
import Image from 'next/image'

export function ScreenshotPreview({ url, screenshotUrl }: { url: string; screenshotUrl: string }) {
  return (
    <div className="rounded-xl bg-[#131f35] border border-white/[0.08] overflow-hidden">
      {/* Browser chrome */}
      <div className="px-4 py-2.5 border-b border-white/[0.07] bg-[#1b2336] flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-center text-[11px] text-[#475569] font-mono truncate bg-black/30 px-[10px] py-[3px] rounded mx-2">
          {url}
        </span>
      </div>
      <div className="relative w-full aspect-video bg-[#0d1929]">
        <Image
          src={screenshotUrl}
          alt={`Screenshot of ${url}`}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 896px"
          unoptimized
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4.2: Commit**

```bash
git add src/components/ScreenshotPreview.tsx
git commit -m "feat: update ScreenshotPreview chrome bar styling"
```

---

## Task 5: Update ShareButton ghost style

**Files:**
- Modify: `src/components/ShareButton.tsx`

The default (not-copied) button state changes from `border-slate-600/80 text-slate-400` to the ghost style `bg-white/[0.05] border-white/[0.10]`. The copied state (green) stays unchanged.

- [ ] **Step 5.1: Update ShareButton.tsx**

Replace the entire file `src/components/ShareButton.tsx`:

```typescript
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
      alert('Could not copy link. URL: ' + url)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`min-h-[44px] px-4 flex items-center gap-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
        copied
          ? 'bg-green-500/15 border-green-500/40 text-green-400'
          : 'bg-white/[0.05] border-white/[0.10] text-slate-400 hover:bg-white/[0.09] hover:border-white/[0.15] hover:text-slate-300'
      }`}
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
      {copied ? 'Link copied' : 'Copy link'}
    </button>
  )
}
```

- [ ] **Step 5.2: Run the ShareButton tests**

```bash
npm test -- src/components/ShareButton
```

Expected: all passing (the tests check clipboard behaviour, not styling).

- [ ] **Step 5.3: Commit**

```bash
git add src/components/ShareButton.tsx
git commit -m "feat: update ShareButton to ghost style"
```

---

## Task 6: Update results page — eyebrow, subtitle, background

**Files:**
- Modify: `src/app/results/[jobId]/page.tsx`

Three changes in this file:
1. All three `bg-[#0f172a]` wrappers → `bg-[#060d1a]`
2. The success-path title block: add green eyebrow label above `<h1>` and a subtitle line below showing `Analysed <date> · N issues found`
3. The `ResultsHeader` error-path wrappers also get the new background

- [ ] **Step 6.1: Update the page file**

Open `src/app/results/[jobId]/page.tsx`. Apply the following changes:

**Change A** — Update all three `min-h-dvh` wrapper background colours (lines 77, 99, 144). Find every occurrence of:
```tsx
<div className="min-h-dvh bg-[#0f172a] flex flex-col">
```
Replace each with:
```tsx
<div className="min-h-dvh bg-[#060d1a] flex flex-col">
```
There are three occurrences — the no-result error path, the failed-status error path, and the main success path.

**Change B** — Add the `analysedDate` variable. After the `issueLabel` block (around line 141), add:
```tsx
const analysedDate = result.job.created_at.toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
```

**Change C** — Replace the Section 1 title block. Find:
```tsx
{/* Section 1 — Page title + ShareButton */}
<div className="flex items-start justify-between gap-4 mb-8">
  <div>
    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">UX Analysis</p>
    <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{hostname}</h1>
  </div>
  <div className="mt-1 shrink-0">
    <ShareButton />
  </div>
</div>
```
Replace with:
```tsx
{/* Section 1 — Page title + ShareButton */}
<div className="flex items-start justify-between gap-4 mb-8">
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-green-400 mb-1">
      UX Analysis
    </p>
    <h1 className="text-[26px] font-bold text-slate-100 tracking-tight leading-tight">
      {hostname}
    </h1>
    <p className="text-[13px] text-[#64748b] mt-1">
      Analysed {analysedDate} · {issueCount === 0 ? 'no issues found' : issueCount === 1 ? '1 issue found' : `${issueCount} issues found`}
    </p>
  </div>
  <div className="mt-1 shrink-0">
    <ShareButton />
  </div>
</div>
```

- [ ] **Step 6.2: Run typecheck to confirm no type errors**

```bash
npm run typecheck
```

Expected: no errors. If `created_at` is flagged, check that the `job` field is properly typed via Prisma — it's a `DateTime` field so `.toLocaleDateString()` is valid.

- [ ] **Step 6.3: Commit**

```bash
git add src/app/results/[jobId]/page.tsx
git commit -m "feat: update results page — darker bg, green eyebrow, analysed date subtitle"
```

---

## Task 7: Update dashboard page background

**Files:**
- Modify: `src/app/(dashboard)/page.tsx`

Single colour change only — the hero page background matches the results page. No functional or layout changes.

- [ ] **Step 7.1: Update the background colour**

In `src/app/(dashboard)/page.tsx`, find the outermost wrapper:
```tsx
<div className="min-h-dvh bg-[#0f172a] flex flex-col">
```
Replace with:
```tsx
<div className="min-h-dvh bg-[#060d1a] flex flex-col">
```

- [ ] **Step 7.2: Commit**

```bash
git add src/app/(dashboard)/page.tsx
git commit -m "feat: update dashboard page background to match results page"
```

---

## Task 8: Final verification

- [ ] **Step 8.1: Run the full test suite**

```bash
npm test
```

Expected: all tests pass, including the 6 new SSRF guard tests and 9 new IssueCard tests.

- [ ] **Step 8.2: Run typecheck**

```bash
npm run typecheck
```

Expected: zero errors.

- [ ] **Step 8.3: Run lint**

```bash
npm run lint
```

Expected: zero errors or warnings. If lint flags anything, fix before committing.

- [ ] **Step 8.4: Commit lint fixes if any**

```bash
git add -p
git commit -m "fix: lint clean-up after UI overhaul"
```

Only run this step if step 8.3 produced fixable warnings. Skip if lint was already clean.
