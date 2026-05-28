import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

  // SSRF guard: only fetch URLs that are Vercel Blob storage URLs.
  // Vercel Blob private URLs carry auth in the URL itself — no Authorization header needed.
  const BLOB_BASE = 'https://blob.vercel-storage.com/'
  if (!result.screenshot_url.startsWith(BLOB_BASE)) {
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
