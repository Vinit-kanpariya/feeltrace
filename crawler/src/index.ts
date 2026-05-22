// crawler/src/index.ts
// Service entry point — initializes the p-queue and starts the Hono HTTP server.
//
// Startup order matters:
//   1. initQueue() — loads p-queue (ESM-only) via dynamic import before requests arrive
//   2. serve()     — binds the Hono app to the PORT Railway injects
//
// Railway injects PORT automatically at runtime. Default 3000 for local development.

import { serve } from '@hono/node-server'
import app from './server'
import { initQueue } from './queue'

async function start(): Promise<void> {
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
