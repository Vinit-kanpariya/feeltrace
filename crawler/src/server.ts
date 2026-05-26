// crawler/src/server.ts
// Hono HTTP server for the FeelTrace crawler service.
// Exposes /health (Railway healthcheck) and /crawl (QStash callback receiver).
//
// Critical constraint (Pitfall 3 / T-02-05):
//   c.req.text() reads the raw body BEFORE any JSON parsing.
//   receiver.verify() must receive the raw string — NOT JSON.stringify(parsed).
//   Signature over re-serialized JSON fails due to key ordering and whitespace differences.

import { Hono } from 'hono'
import { Receiver } from '@upstash/qstash'
import { z } from 'zod/v4'
import { getQueue } from './queue'
import { processJob } from './processor'

const app = new Hono()

// QStash Receiver — verifies HMAC JWT signature on every /crawl request (T-02-04, D-03)
const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
})

// Payload schema — validated after signature verification (T-02-05 mitigation)
const PayloadSchema = z.object({
  jobId: z.string().min(1),
  url: z.string().url(),
})

// Health check — Railway calls this before marking deployment live and on every healthcheck interval
app.get('/health', (c) => c.json({ status: 'ok' }))

// QStash callback endpoint
// Security boundary: any actor on the internet can POST here — signature verification is mandatory
app.post('/crawl', async (c) => {
  // Step 1: Read raw body FIRST — before any JSON parsing (Pitfall 3 / RESEARCH.md Pattern 2)
  // Signature is computed over the original wire bytes, not a re-serialized form
  const rawBody = await c.req.text()

  // Step 2: Check for signature header presence
  const signature = c.req.header('upstash-signature')
  if (!signature) {
    return c.json({ error: 'Missing signature' }, 401)
  }

  // Step 3: Verify QStash HMAC JWT signature (T-02-04 mitigation)
  // receiver.verify() throws on invalid or expired signatures
  try {
    await receiver.verify({
      body: rawBody, // MUST be raw string — not JSON.stringify(parsed)
      signature,
      url: process.env.RAILWAY_CRAWLER_URL!, // must exactly match the URL QStash delivered to (T-02-07)
    })
  } catch {
    return c.json({ error: 'Invalid signature' }, 401)
  }

  // Step 4: Parse and validate payload (after signature verification — body is trusted)
  let payload: z.infer<typeof PayloadSchema>
  try {
    payload = PayloadSchema.parse(JSON.parse(rawBody))
  } catch {
    return c.json({ error: 'Invalid payload' }, 400)
  }

  // Step 5: Return 200 IMMEDIATELY (D-04) — QStash retries if we don't respond quickly
  // Enqueue job for async sequential processing (D-23: concurrency 1)
  const q = await getQueue()
  q.add(() => processJob(payload.jobId, payload.url))

  return c.json({ received: true }, 200)
})

export default app
