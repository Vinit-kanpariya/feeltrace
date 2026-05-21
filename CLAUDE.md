# FeelTrace — Trace how users actually experience your UI

## Project Overview
FeelTrace is a UX analytics platform that gives teams a complete picture of how users *feel* while using their product. It combines quantitative interaction data (clicks, rage clicks, scroll depth), session replays with team annotations, and emotion/frustration inference from interaction patterns into a unified UX experience score.

Customers embed a lightweight `<script>` snippet into their site. The snippet streams events to FeelTrace, which processes and visualises them in a Next.js dashboard.

**Target users:** Product teams, UX designers, and frontend engineers who want more signal than Google Analytics gives them but don't want the complexity of a full Mixpanel/FullStory stack.

## Tech Stack
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL via Neon (serverless)
- **ORM:** Prisma
- **Auth:** NextAuth.js (or Clerk)
- **Hosting:** Vercel
- **Tracker:** Standalone vanilla-JS snippet (built separately, served from `/public` or CDN)

## Architecture
```
feeltrace/
├── src/
│   ├── app/              # Next.js App Router — pages + API routes
│   │   ├── (dashboard)/  # Authenticated dashboard pages
│   │   ├── (marketing)/  # Public marketing/landing pages
│   │   └── api/          # API routes (ingest, auth, analytics)
│   ├── components/       # Shared React components
│   ├── lib/              # DB client, auth helpers, shared utils
│   └── types/            # Shared TypeScript types
├── tracker/              # Embeddable JS snippet (separate build)
│   ├── src/
│   └── dist/             # Built output — feeltrace.min.js
├── prisma/               # DB schema and migrations
└── public/               # Static assets
```

**Data flow:**
1. Customer embeds `<script src="https://cdn.feeltrace.io/ft.min.js">` with their project API key
2. Tracker captures DOM events → batches → POSTs to `/api/ingest`
3. Ingest route validates the API key, writes events to Postgres
4. Dashboard reads/aggregates events to render heatmaps, replays, and experience scores

**Key boundaries:**
- `tracker/` is a completely independent vanilla-JS build — it must have zero runtime dependencies and a sub-5 KB gzipped budget. Never import anything from `src/` into `tracker/`.
- `/api/ingest` is a hot path — keep it thin. No heavy processing inline; queue or batch-write.

## Conventions
- Use the App Router (`src/app/`) — no Pages Router
- Server Components by default; add `"use client"` only when necessary
- Prisma for all DB access — never raw SQL unless in a migration
- API routes live under `src/app/api/` and follow REST conventions
- Environment variables: public vars use `NEXT_PUBLIC_` prefix, never expose secret keys to the client
- Event names in the tracker follow `snake_case` (e.g. `rage_click`, `scroll_depth`, `session_start`)
- Experience score is always a float 0.0–10.0; never store it as an integer

## Commands
```bash
# Development
npm run dev              # Start Next.js dev server on :3000
npm run dev:tracker      # Watch-build the tracker snippet

# Database
npm run db:push          # Push Prisma schema to DB (dev only)
npm run db:migrate       # Run migrations (production-safe)
npm run db:studio        # Open Prisma Studio

# Quality
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit
npm test                 # Vitest unit tests

# Build
npm run build            # Next.js production build
npm run build:tracker    # Production build of tracker snippet
```

## Boundaries
NEVER modify:
- `tracker/dist/` — generated output, changes are overwritten on build
- `prisma/migrations/` — never edit committed migrations, always create new ones
- `.env.local` — local secrets, never commit

## Domain Knowledge
- **Experience Score** — proprietary 0.0–10.0 float derived from interaction signals. Higher = better UX. Do not rename or round this value in the DB.
- **Rage click** — 3+ rapid clicks on the same element within 500 ms; a strong frustration signal.
- **Session** — a continuous period of user activity; ends after 30 min of inactivity.
- **Project** — a FeelTrace tenant unit; one customer site = one Project, identified by an API key.
- **Heatmap** — aggregated click/hover density rendered as a visual overlay on a page screenshot.
- **Replay** — a time-ordered sequence of captured events that can be replayed to reconstruct a session.
- The tracker snippet is a first-party concern — FeelTrace controls both the embed script and the ingest endpoint, unlike third-party analytics tools.

## Code Intelligence

Prefer LSP over Grep/Glob/Read for code navigation:
- `goToDefinition` / `goToImplementation` to jump to source
- `findReferences` to see all usages across the codebase
- `workspaceSymbol` to find where something is defined
- `documentSymbol` to list all symbols in a file
- `hover` for type info without reading the file
- `incomingCalls` / `outgoingCalls` for call hierarchy

Before renaming or changing a function signature, use
`findReferences` to find all call sites first.

Use Grep/Glob only for text/pattern searches (comments,
strings, config values) where LSP doesn't help.

After writing or editing code, check LSP diagnostics before
moving on. Fix any type errors or missing imports immediately.

## Package Security

ALWAYS prefix package install commands with `sfw` (Socket Firewall):
- `sfw npm install` instead of `npm install`
- `sfw pip install` instead of `pip install`
- `sfw yarn add` instead of `yarn add`

This blocks malicious packages before they enter the codebase.
NEVER run bare npm/pip/yarn install without the `sfw` prefix.
