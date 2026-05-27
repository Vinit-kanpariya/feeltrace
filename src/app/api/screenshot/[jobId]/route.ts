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

  const blobRes = await fetch(result.screenshot_url, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  })

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
