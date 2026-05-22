// src/app/api/jobs/[jobId]/route.ts
// GET /api/jobs/[jobId] — job status polling endpoint
// Source: .planning/phases/01-data-foundation-and-security-baseline/01-RESEARCH.md
//         Code Examples section: GET /api/jobs/[jobId] — Status Polling Route
//
// Used by: client-side JobStatusBadge component polling every 2 seconds (D-11, INFRA-04)
// Returns: { status: JobStatus, error_message?: string }
// Errors:  { error: string } with 404 if job not found — no stack traces (T-01-14)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  // Next.js 15 App Router: params is a Promise — must await before use
  const { jobId } = await params

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { status: true, error_message: true },
  })

  if (!job) {
    // Return 404 — no internal details exposed (T-01-14)
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // Return status and conditionally include error_message (only present on 'failed' status)
  return NextResponse.json({
    status: job.status,
    ...(job.error_message ? { error_message: job.error_message } : {}),
  })
}
