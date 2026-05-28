import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Vercel Blob URL patterns this proxy accepts:
 *   https://<store-id>.public.blob.vercel-storage.com/<path>   (public)
 *   https://<store-id>.private.blob.vercel-storage.com/<path>  (private)
 *   https://blob.vercel-storage.com/<path>                     (legacy)
 *
 * Exported for unit testing.
 */
export const VERCEL_BLOB_RE =
  /^https:\/\/(?:[a-zA-Z0-9-]+\.(?:public|private)\.blob|blob)\.vercel-storage\.com\//

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
    console.log(`[screenshot] ${jobId}: screenshot_url is null in DB`)
    return new NextResponse(null, { status: 404 })
  }

  if (!isAllowedBlobUrl(result.screenshot_url)) {
    console.error(`[screenshot] ${jobId}: SSRF guard blocked URL: ${result.screenshot_url.slice(0, 80)}`)
    return new NextResponse(null, { status: 400 })
  }

  const isPrivate = !result.screenshot_url.includes('.public.blob.')
  console.log(`[screenshot] ${jobId}: fetching ${isPrivate ? 'private' : 'public'} blob — ${result.screenshot_url.slice(0, 80)}`)

  const blobRes = await fetch(result.screenshot_url, {
    ...(isPrivate && process.env.BLOB_READ_WRITE_TOKEN
      ? { headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` } }
      : {}),
  })

  if (!blobRes.ok) {
    console.error(`[screenshot] ${jobId}: blob fetch failed — HTTP ${blobRes.status} ${blobRes.statusText}`)
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
