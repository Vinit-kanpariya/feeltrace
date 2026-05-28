import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Vercel Blob public URL patterns this proxy accepts:
 *   https://<store-id>.public.blob.vercel-storage.com/<path>
 *   https://blob.vercel-storage.com/<path>   (legacy / private)
 *
 * Exported for unit testing.
 */
export const VERCEL_BLOB_RE =
  /^https:\/\/(?:[a-zA-Z0-9-]+\.public\.blob|blob)\.vercel-storage\.com\//

export function isAllowedBlobUrl(url: string): boolean {
  return VERCEL_BLOB_RE.test(url)
}

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

  if (!isAllowedBlobUrl(result.screenshot_url)) {
    return new NextResponse(null, { status: 400 })
  }

  const blobRes = await fetch(result.screenshot_url)

  if (!blobRes.ok) {
    return new NextResponse(null, { status: blobRes.status })
  }

  const contentType = blobRes.headers.get('content-type') ?? 'image/jpeg'

  return new NextResponse(blobRes.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
