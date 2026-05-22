// src/app/api/analyze/route.ts
// POST /api/analyze — SSRF check, queue depth cap, job creation, QStash publish
// Source: .planning/phases/01-data-foundation-and-security-baseline/01-RESEARCH.md Pattern 6
//
// Security controls:
//   T-01-12: SSRF prevented via validateUrl (dns.promises.lookup + RFC-1918 range check)
//   T-01-13: DoS prevented via queue depth cap of 50 (D-09) + Edge Middleware rate limit (Plan 06)
//   T-01-14: No stack traces in error responses (ASVS V7) — all catch blocks return sanitized messages
//   T-01-15: QStash publish failure marks job failed so client polling sees 'failed' and stops

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { qstash } from '@/lib/qstash'
import { validateUrl, SsrfError } from '@/lib/ssrf'

const BodySchema = z.object({
  url: z.string().min(1),
})

export async function POST(request: NextRequest) {
  // 1. Parse and validate body — return 400 on any parse/validation failure
  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await request.json())
  } catch {
    // No stack traces — ASVS V7 / T-01-14
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // 2. SSRF validation (D-13, D-14, D-15)
  // validateUrl resolves hostname via dns.promises.lookup { all: true } and checks all
  // returned IPs against RFC-1918 ranges, loopback, link-local, and non-http schemes.
  // No DB write or QStash publish happens if this check fails.
  try {
    await validateUrl(body.url)
  } catch (err) {
    if (err instanceof SsrfError) {
      // Return structured error — code is machine-readable for client-side error mapping (D-12)
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 422 },
      )
    }
    // Unexpected error from validateUrl — re-throw (will be caught by Next.js error boundary)
    throw err
  }

  // 3. Global queue depth cap (D-09)
  // Source of truth is the DB, not Redis. Count pending + crawling jobs.
  const pendingCount = await prisma.job.count({
    where: { status: { in: ['pending', 'crawling'] } },
  })
  if (pendingCount >= 50) {
    // Plain text 503 per D-09 — no JSON envelope
    return new Response('Service busy. Please try again shortly.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  // 4. Create job record in DB — status defaults to 'pending' per Prisma schema
  const job = await prisma.job.create({
    data: { url: body.url, status: 'pending' },
  })

  // 5. Publish to QStash (D-01, D-02)
  // QStash delivers the message to RAILWAY_CRAWLER_URL via HTTP POST (push/callback model).
  // On failure: mark job failed (Claude's Discretion) so client polling sees a terminal state.
  try {
    await qstash.publishJSON({
      url: process.env.RAILWAY_CRAWLER_URL!,
      body: { jobId: job.id, url: body.url },
      retries: 3,
    })
  } catch {
    // T-01-15: Job must reach a terminal state if publish fails — client stops polling at 'failed'
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: 'failed',
        error_message: 'Failed to enqueue analysis job. Please try again.',
      },
    })
    // No stack traces in error response — T-01-14
    return NextResponse.json({ error: 'Failed to start analysis' }, { status: 503 })
  }

  // 6. Return jobId so client can begin polling GET /api/jobs/[jobId]
  return NextResponse.json({ jobId: job.id }, { status: 202 })
}
