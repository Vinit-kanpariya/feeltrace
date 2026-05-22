/**
 * crawler/src/server.test.ts
 * TDD tests for the Hono server routes (02-02-PLAN.md Task 1)
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @upstash/qstash Receiver before importing server
vi.mock('@upstash/qstash', () => {
  const mockVerify = vi.fn()
  return {
    Receiver: vi.fn().mockImplementation(() => ({
      verify: mockVerify,
    })),
    __mockVerify: mockVerify,
  }
})

// Mock the queue module to avoid p-queue ESM/async initialization
vi.mock('./queue', () => ({
  getQueue: vi.fn().mockResolvedValue({
    add: vi.fn().mockResolvedValue(undefined),
  }),
}))

// Mock the processor stub
vi.mock('./processor', () => ({
  processJob: vi.fn().mockResolvedValue(undefined),
}))

// Import after mocks are set up
let app: import('hono').Hono

async function getApp() {
  if (!app) {
    const mod = await import('./server')
    app = mod.default
  }
  return app
}

async function getMockVerify() {
  const qstash = await import('@upstash/qstash')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (qstash as any).__mockVerify as ReturnType<typeof vi.fn>
}

describe('GET /health', () => {
  it('returns 200 with { status: "ok" }', async () => {
    const server = await getApp()
    const req = new Request('http://localhost/health', { method: 'GET' })
    const res = await server.fetch(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ status: 'ok' })
  })
})

describe('POST /crawl', () => {
  beforeEach(async () => {
    const mockVerify = await getMockVerify()
    mockVerify.mockReset()
  })

  it('returns 401 when Upstash-Signature header is missing', async () => {
    const server = await getApp()
    const req = new Request('http://localhost/crawl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: 'test-job', url: 'https://example.com' }),
    })
    const res = await server.fetch(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toEqual({ error: 'Missing signature' })
  })

  it('returns 401 when signature is invalid', async () => {
    const mockVerify = await getMockVerify()
    mockVerify.mockRejectedValueOnce(new Error('Invalid signature'))

    const server = await getApp()
    const req = new Request('http://localhost/crawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'upstash-signature': 'invalid-sig',
      },
      body: JSON.stringify({ jobId: 'test-job', url: 'https://example.com' }),
    })
    const res = await server.fetch(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toEqual({ error: 'Invalid signature' })
  })

  it('returns 400 when payload is missing jobId', async () => {
    const mockVerify = await getMockVerify()
    mockVerify.mockResolvedValueOnce(true)

    const server = await getApp()
    const req = new Request('http://localhost/crawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'upstash-signature': 'valid-sig',
      },
      body: JSON.stringify({ url: 'https://example.com' }), // missing jobId
    })
    const res = await server.fetch(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({ error: 'Invalid payload' })
  })

  it('returns 400 when payload has malformed url', async () => {
    const mockVerify = await getMockVerify()
    mockVerify.mockResolvedValueOnce(true)

    const server = await getApp()
    const req = new Request('http://localhost/crawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'upstash-signature': 'valid-sig',
      },
      body: JSON.stringify({ jobId: 'test-job', url: 'not-a-url' }),
    })
    const res = await server.fetch(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({ error: 'Invalid payload' })
  })

  it('returns 200 with { received: true } for valid signature and payload', async () => {
    const mockVerify = await getMockVerify()
    mockVerify.mockResolvedValueOnce(true)

    const server = await getApp()
    const req = new Request('http://localhost/crawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'upstash-signature': 'valid-sig',
      },
      body: JSON.stringify({ jobId: 'test-job-123', url: 'https://example.com' }),
    })
    const res = await server.fetch(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ received: true })
  })

  it('verifies signature using raw body string (not parsed JSON)', async () => {
    const mockVerify = await getMockVerify()
    mockVerify.mockResolvedValueOnce(true)

    const server = await getApp()
    const rawBody = JSON.stringify({ jobId: 'test-job-456', url: 'https://example.com' })
    const req = new Request('http://localhost/crawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'upstash-signature': 'valid-sig',
      },
      body: rawBody,
    })
    await server.fetch(req)

    // Verify that receiver.verify() was called with the raw string body
    expect(mockVerify).toHaveBeenCalledWith(
      expect.objectContaining({
        body: rawBody,
        signature: 'valid-sig',
      })
    )
  })
})
