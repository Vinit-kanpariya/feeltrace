// src/app/api/results/[jobId]/route.ts
// GET /api/results/[jobId] — completed results endpoint
// Source: .planning/phases/01-data-foundation-and-security-baseline/01-05-PLAN.md Task 2
//
// Returns the full Result (with issues and causal edges) for a completed job.
// Phase 1 UI shows this as a raw JSON dump in a <pre> block (D-11).
//
// 404 conditions:
//   - Job not found
//   - Job exists but status !== 'complete' (D-11: only show results when complete)
//   - Job is complete but no Result record exists (data integrity fallback)
//
// No stack traces in error responses (T-01-14).

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  // Next.js 15 App Router: params is a Promise — must await before use
  const { jobId } = await params

  // First verify the job exists and has completed — no result before completion (D-11)
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { status: true },
  })

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  if (job.status !== 'complete') {
    // Return 404 with current status so client can distinguish "not ready" from "not found"
    return NextResponse.json(
      { error: 'Results not yet available', status: job.status },
      { status: 404 },
    )
  }

  // Fetch the Result with all associated issues and causal edges
  const result = await prisma.result.findUnique({
    where: { jobId },
    include: { issues: true, edges: true },
  })

  if (!result) {
    // Job is complete but Result doesn't exist — data integrity fallback
    return NextResponse.json({ error: 'Result not found' }, { status: 404 })
  }

  // Phase 1: return raw JSON serialization (D-11 — full JSON dump)
  return NextResponse.json(result)
}
