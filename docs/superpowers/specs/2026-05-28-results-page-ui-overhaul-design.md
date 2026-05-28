# FeelTrace Results Page — UI Overhaul Design

**Date:** 2026-05-28
**Status:** Approved
**Scope:** Three targeted fixes to the `/results/[jobId]` page and its components

---

## Problem Statement

Three issues observed on the results page:

1. **Screenshot shows alt text** — `ScreenshotPreview` renders but the image fails to load. Root cause: the SSRF guard in `src/app/api/screenshot/[jobId]/route.ts` checks for `https://blob.vercel-storage.com/` but actual Vercel Blob public URLs use the format `https://<store-id>.public.blob.vercel-storage.com/...`, which never matches.

2. **"How to fix" not visible** — `IssueCard`'s `fix_suggestion` field is rendered as a single `text-xs font-mono text-slate-500` line inside a monospace code block. It is visually indistinguishable from the evidence lines and is entirely absent on pre-Phase-7 rows where the field is empty.

3. **UI looks AI-generated** — All cards share identical `bg-slate-800/40 border border-slate-700/60` styling with no visual hierarchy differentiation. No hover states, flat spacing, and the severity left-border is the only visual signal.

---

## Design System

Derived from ui-ux-pro-max. Style: **Dark Mode OLED + Data-Dense Dashboard hybrid**.

| Token | Value | Usage |
|-------|-------|-------|
| `page-bg` | `#060d1a` | Page background (deeper than current `#0f172a`) |
| `card-bg` | `#131f35` | All card surfaces |
| `card-bg-hover` | `#172240` | Card hover state |
| `border` | `rgba(255,255,255,0.08)` | All borders |
| `border-hover` | `rgba(255,255,255,0.13)` | Borders on hover |
| `text-primary` | `#f8fafc` | Page title, issue description |
| `text-secondary` | `#94a3b8` | Narrative body, muted content |
| `text-muted` | `#64748b` | Labels, subtitles |
| `text-dim` | `#475569` | Signal tags, evidence keys |
| `text-faint` | `#334155` | Evidence values, footer |
| `accent-green` | `#22c55e` | Logo, eyebrow label, fix callout border |
| `fix-bg` | `rgba(34,197,94,0.06)` | Fix callout background |
| `fix-border` | `rgba(34,197,94,0.18)` | Fix callout border |
| `fix-text` | `#86efac` | Fix callout body text |
| `fix-label` | `#16a34a` | "HOW TO FIX" label |

Severity colors (unchanged):
- Critical: `#ef4444` · High: `#f97316` · Medium: `#eab308` · Low: `#22c55e`

Typography: Inter (body/descriptions at 13px/1.65 line-height), system monospace (evidence/signal at 11px).

---

## Change 1 — Screenshot Proxy SSRF Guard

**File:** `src/app/api/screenshot/[jobId]/route.ts`

**Current behaviour:** Guard rejects all requests because it checks for `https://blob.vercel-storage.com/` (a prefix that doesn't match real Vercel Blob URLs).

**Fix:** Replace the exact-prefix check with a regex that matches both known Vercel Blob URL patterns:
- `https://<store-id>.public.blob.vercel-storage.com/...`
- `https://blob.vercel-storage.com/...` (kept for forward compat)

```
const VERCEL_BLOB_RE = /^https:\/\/[a-zA-Z0-9-]+\.(?:public\.)?blob\.vercel-storage\.com\//
```

If the URL does not match, return `400` as before.

---

## Change 2 — IssueCard "How to Fix" Callout

**File:** `src/components/IssueCard.tsx`

**Current behaviour:** `fix_suggestion` renders as a monospace line identical in weight and colour to the `signal` and `evidence` lines. On pre-Phase-7 rows where `fix_suggestion === ""` it is silently omitted with no visual gap.

**New behaviour:** When `fix_suggestion` is present and non-empty, render a distinct callout block **below** the evidence block:

```
┌─ green callout ─────────────────────────────────────┐
│  [wrench icon]  HOW TO FIX                           │
│                 <fix_suggestion text>                │
└──────────────────────────────────────────────────────┘
```

- Background: `rgba(34,197,94,0.06)`, border: `rgba(34,197,94,0.18)`, radius: `8px`
- Label: `9px` uppercase `#16a34a` font-weight 700
- Text: `12px` `#86efac` line-height `1.65`
- Icon: Pencil/edit SVG 11px in a `rgba(34,197,94,0.12)` pill

When `fix_suggestion` is absent (pre-Phase-7 rows): callout is entirely omitted. No placeholder or "N/A" text.

The evidence block is also upgraded — `signal_source` and `raw_evidence` move into a clearly labelled `EVIDENCE` sub-block with `background: rgba(0,0,0,0.35)` to visually contain the technical data.

`severity_justification` (when present) moves inside the evidence block as an `impact` row.

---

## Change 3 — Visual Polish (Results Page + Components)

### 3a. Page background
`bg-[#0f172a]` → `bg-[#060d1a]` on the wrapping `<div>` in `results/[jobId]/page.tsx` and `(dashboard)/page.tsx`.

### 3b. IssueCard layout

Replace left-border accent with **3px top bar** (`border-top: 3px solid <severity-color>`). Remove `style={{ borderLeft }}` inline style.

Card container:
```
bg-[#131f35] border border-white/[0.07] rounded-[10px] overflow-hidden mb-[10px]
transition-colors duration-200 hover:bg-[#172240] hover:border-white/[0.13]
```

Meta row (top of card inner):
- Left: `SeverityBadge` (updated — see below) + category label
- Right: `signal_source` in a monospace tag `bg-black/30 text-[#334155] text-[10px] px-[7px] py-[2px] rounded`

Description: `text-[13px] text-slate-200 leading-[1.65] font-normal mb-3`

### 3c. SeverityBadge — no changes needed
`SeverityBadge` already renders word labels ("Critical / High / Medium / Low") with coloured pill styling using `SEVERITY_LABELS` from `@/types/narrative`. No modifications required.

### 3d. NarrativeSection
Switch from stacked blocks to a **two-column label + text** layout:
- Label column: `90px` fixed width, `10px` uppercase `#334155`, flex-shrink 0
- Text column: `13px` `#94a3b8` line-height `1.65`
- Dividers: `h-px bg-white/[0.05]`
- Section header: add a 6px green dot beside "What users experience" title

### 3e. Page title section
- Add `page-eyebrow` label: `11px` uppercase `#22c55e` above the hostname h1
- Add subtitle line: `13px #64748b` showing `Analysed <date> · N issues found` where date is derived from `result.job.created_at` formatted as a locale date string (e.g. "28 May 2026")
- Share button: ghost style (`bg-white/[0.05] border-white/[0.10]`, hover to `bg-white/[0.09]`)

### 3f. ScreenshotPreview
- Upgrade chrome bar to `bg-[#1b2336]` (slightly lighter than card bg, more distinct)
- URL bar pill: `bg-black/30 rounded px-[10px]`
- Chrome dots: keep `bg-slate-600`, no change needed

---

## Out of Scope

- Homepage (`(dashboard)/page.tsx`) — visual changes limited to page background colour only; hero content and form card are not modified
- Causality graph, TechStackSection, GraphAbsent — not touched
- Any database or Prisma schema changes
- Pre-Phase-7 data backfill (fix_suggestion is simply absent for old rows)

---

## Acceptance Criteria

1. Visiting a results page with a screenshot: the screenshot image renders (no alt text visible)
2. Visiting a results page with a Phase-7+ issue: "HOW TO FIX" green callout is visible and clearly distinguished from evidence
3. Visiting a results page with a pre-Phase-7 issue: card renders without the fix callout, no broken layout
4. All issue cards show a top-border bar matching severity colour
5. Cards have a visible hover state (background lightens smoothly)
6. Narrative section renders in label+text two-column layout
7. No type errors (`npm run typecheck` passes)
8. No lint errors (`npm run lint` passes)
