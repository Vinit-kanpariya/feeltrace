// src/app/api/analyze/route.test.ts
// Unit tests for POST /api/analyze
// Source: .planning/phases/01-data-foundation-and-security-baseline/01-05-PLAN.md Task 1
// SSRF Unit Test Pattern from 01-RESEARCH.md

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock @/lib/prisma — use vi.fn() for all job methods used by the route
vi.mock('@/lib/prisma', () => ({
  prisma: {
    job: {
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}))

// Mock @/lib/qstash — use vi.fn() for publishJSON
vi.mock('@/lib/qstash', () => ({
  qstash: {
    publishJSON: vi.fn(),
  },
}))

// Mock @/lib/ssrf — re-create SsrfError as a class so instanceof checks work in tests
// (cannot import the real SsrfError because the module is mocked)
vi.mock('@/lib/ssrf', () => ({
  validateUrl: vi.fn(),
  SsrfError: class SsrfError extends Error {
    code: string
    constructor(message: string, code: string) {
      super(message)
      this.name = 'SsrfError'
      this.code = code
    }
  },
}))

// Import after mocks are set up
import { POST } from './route'
import { prisma } from '@/lib/prisma'
import { qstash } from '@/lib/qstash'
import { validateUrl, SsrfError } from '@/lib/ssrf'

const mockPrismaJob = prisma.job as unknown as {
  create: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  count: ReturnType<typeof vi.fn>
}
const mockQstash = qstash as unknown as { publishJSON: ReturnType<typeof vi.fn> }
const mockValidateUrl = validateUrl as ReturnType<typeof vi.fn>

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function makeBadRequest(): NextRequest {
  return new NextRequest('http://localhost/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: 'not json at all }{',
  })
}

describe('POST /api/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: no env var needed — set a placeholder
    process.env.RAILWAY_CRAWLER_URL = 'https://crawler.example.com/api/crawl'
  })

  it('Test 1 (happy path): returns 202 with jobId on valid URL', async () => {
    // Arrange
    mockValidateUrl.mockResolvedValue(undefined)
    mockPrismaJob.count.mockResolvedValue(0)
    mockPrismaJob.create.mockResolvedValue({ id: 'job_123' })
    mockQstash.publishJSON.mockResolvedValue({ messageId: 'msg_abc' })

    // Act
    const response = await POST(makeRequest({ url: 'https://example.com' }))

    // Assert
    expect(response.status).toBe(202)
    const body = await response.json()
    expect(body).toEqual({ jobId: 'job_123' })
  })

  it('Test 2 (SSRF blocked): returns 422 with BLOCKED_IP when validateUrl throws SsrfError', async () => {
    // Arrange — throw a SsrfError from the mocked validateUrl
    const ssrfErr = new SsrfError('Blocked', 'BLOCKED_IP')
    mockValidateUrl.mockRejectedValue(ssrfErr)

    // Act
    const response = await POST(makeRequest({ url: 'https://10.0.0.1' }))

    // Assert
    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body.code).toBe('BLOCKED_IP')
    expect(body.error).toBeDefined()
    // prisma.job.create must NOT be called
    expect(mockPrismaJob.create).not.toHaveBeenCalled()
  })

  it('Test 3 (queue full): returns 503 plain text when count >= 50', async () => {
    // Arrange
    mockValidateUrl.mockResolvedValue(undefined)
    mockPrismaJob.count.mockResolvedValue(50)

    // Act
    const response = await POST(makeRequest({ url: 'https://example.com' }))

    // Assert
    expect(response.status).toBe(503)
    const text = await response.text()
    expect(text).toContain('Service busy')
  })

  it('Test 4 (bad body): returns 400 when body is not valid JSON', async () => {
    // Act
    const response = await POST(makeBadRequest())

    // Assert
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ error: 'Invalid request body' })
  })

  it('Test 5 (QStash failure): marks job failed and returns 503 when publishJSON throws', async () => {
    // Arrange
    mockValidateUrl.mockResolvedValue(undefined)
    mockPrismaJob.count.mockResolvedValue(0)
    mockPrismaJob.create.mockResolvedValue({ id: 'job_456' })
    mockQstash.publishJSON.mockRejectedValue(new Error('QStash unavailable'))
    mockPrismaJob.update.mockResolvedValue({})

    // Act
    const response = await POST(makeRequest({ url: 'https://example.com' }))

    // Assert — job should be updated to failed
    expect(mockPrismaJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job_456' },
        data: expect.objectContaining({ status: 'failed' }),
      }),
    )
    expect(response.status).toBe(503)
  })
})
