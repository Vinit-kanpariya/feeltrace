// crawler/src/index.ts
// Service entry point — initializes the p-queue and starts the Hono HTTP server.
//
// Startup order matters:
//   1. dotenv    — load .env (crawler-local) then root .env.local for local dev
//   2. initQueue() — loads p-queue (ESM-only) via dynamic import before requests arrive
//   3. serve()     — binds the Hono app to the PORT Railway injects
//
// Railway injects PORT automatically at runtime. Default 3000 for local development.

import { config as loadEnv } from 'dotenv'
import { resolve } from 'path'

// Load crawler/.env first (Railway/prod overrides stay in process.env, dotenv won't clobber them).
// Then fall back to the root project's .env.local so local dev works without duplicating secrets.
loadEnv({ path: resolve(__dirname, '../.env') })          // crawler/.env  (optional)
loadEnv({ path: resolve(__dirname, '../../.env.local') }) // root .env.local (local dev)

import { serve } from '@hono/node-server'
import app from './server'
import { initQueue } from './queue'

async function start(): Promise<void> {
  // Step 0: Validate required env vars before doing anything else.
  // Fail fast with a named-variable error so misconfiguration is immediately actionable.

  // RAILWAY_CRAWLER_URL: must be present AND a valid URL (used by QStash signature verify)
  if (!process.env.RAILWAY_CRAWLER_URL) {
    console.error('[feeltrace-crawler] Missing or invalid required env var: RAILWAY_CRAWLER_URL')
    process.exit(1)
  }
  try {
    new URL(process.env.RAILWAY_CRAWLER_URL)
  } catch {
    console.error('[feeltrace-crawler] Missing or invalid required env var: RAILWAY_CRAWLER_URL')
    process.exit(1)
  }

  // QSTASH_CURRENT_SIGNING_KEY: must be present (used by QStash Receiver)
  if (!process.env.QSTASH_CURRENT_SIGNING_KEY) {
    console.error('[feeltrace-crawler] Missing or invalid required env var: QSTASH_CURRENT_SIGNING_KEY')
    process.exit(1)
  }

  // QSTASH_NEXT_SIGNING_KEY: must be present (used by QStash Receiver for key rotation)
  if (!process.env.QSTASH_NEXT_SIGNING_KEY) {
    console.error('[feeltrace-crawler] Missing or invalid required env var: QSTASH_NEXT_SIGNING_KEY')
    process.exit(1)
  }

  // GROQ_API_KEY: must be present (used by the AI analysis pipeline in groq-client.ts)
  // WR-02: Without this check the service starts successfully, runs the full browser crawl,
  // then fails every job at the 'analyzing' stage with a Groq authentication error.
  if (!process.env.GROQ_API_KEY) {
    console.error('[feeltrace-crawler] Missing or invalid required env var: GROQ_API_KEY')
    process.exit(1)
  }

  // PAGESPEED_API_KEY is soft-required: PSI/CWV/Lighthouse signals are disabled if absent.
  // Never process.exit(1) — the crawler continues without external signals.
  if (!process.env.PAGESPEED_API_KEY) {
    console.warn('[feeltrace-crawler] PAGESPEED_API_KEY not set — PSI/CWV/Lighthouse signals disabled')
  }

  console.log('[feeltrace-crawler] Crawler URL:', process.env.RAILWAY_CRAWLER_URL)

  // Step 1: Initialize the p-queue singleton before accepting any requests.
  // p-queue v9 is ESM-only — dynamic import must complete before the first /crawl arrives.
  await initQueue()

  // Step 2: Start the Hono HTTP server.
  // Railway injects $PORT at runtime; fallback to 3000 for local dev.
  const port = Number(process.env.PORT ?? 3000)

  serve({ fetch: app.fetch, port })

  console.log('[feeltrace-crawler] Server listening on port', port)
}

start().catch((err) => {
  console.error('[feeltrace-crawler] Failed to start:', err)
  process.exit(1)
})
