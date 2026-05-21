// src/lib/qstash.ts
// Source: .planning/phases/01-data-foundation-and-security-baseline/01-RESEARCH.md Pattern 4
// QStash client singleton — used by POST /api/analyze to publish crawl jobs.
//
// QSTASH_TOKEN is a server-side secret (D-01, T-01-07).
// NEVER expose this via NEXT_PUBLIC_ prefix or return it in any API response.
//
// QStash uses a push (callback) model (D-02): this client publishes a message to QStash,
// which delivers it via HTTP POST to the Railway crawler endpoint.

import { Client } from '@upstash/qstash'

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
})
