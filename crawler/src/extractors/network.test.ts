// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import path from 'node:path'

const { mockReadFile, mockUnlink } = vi.hoisted(() => ({
  mockReadFile: vi.fn(),
  mockUnlink: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('fs/promises', () => ({
  default: { readFile: mockReadFile, unlink: mockUnlink },
  readFile: mockReadFile,
  unlink: mockUnlink,
}))

import { extractNetworkSignals } from './network'

const FIXTURE_PATH = path.join(__dirname, '../../fixtures/network/sample.har')

const FIXTURE_HAR = JSON.stringify({
  log: {
    version: '1.2',
    pages: [
      { id: 'page_1', title: 'https://example.com', startedDateTime: '2024-01-01T00:00:00.000Z', pageTimings: {} },
    ],
    entries: [
      {
        pageref: 'page_1',
        startedDateTime: '2024-01-01T00:00:00.000Z',
        time: 245.3,
        request: { url: 'https://example.com/', method: 'GET', headers: [], queryString: [], cookies: [], headersSize: -1, bodySize: 0 },
        response: { status: 200, statusText: 'OK', headers: [], cookies: [], content: { mimeType: 'text/html', size: 0 }, redirectURL: '', headersSize: -1, bodySize: 1234 },
        timings: { dns: 12.1, connect: 34.5, ssl: 18.2, send: 0.1, wait: 89.3, receive: 91.1 },
      },
      {
        pageref: 'page_1',
        startedDateTime: '2024-01-01T00:00:00.250Z',
        time: 80,
        request: { url: 'https://example.com/styles.css', method: 'GET', headers: [], queryString: [], cookies: [], headersSize: -1, bodySize: 0 },
        response: { status: 200, statusText: 'OK', headers: [], cookies: [], content: { mimeType: 'text/css', size: 0 }, redirectURL: '', headersSize: -1, bodySize: 5000 },
        timings: { dns: 0, connect: 0, ssl: 0, send: 0.1, wait: 45.0, receive: 34.9 },
      },
      {
        pageref: 'page_1',
        startedDateTime: '2024-01-01T00:00:00.330Z',
        time: 300,
        request: { url: 'https://example.com/hero.jpg', method: 'GET', headers: [], queryString: [], cookies: [], headersSize: -1, bodySize: 0 },
        response: { status: 200, statusText: 'OK', headers: [], cookies: [], content: { mimeType: 'image/jpeg', size: 0 }, redirectURL: '', headersSize: -1, bodySize: 153600 },
        timings: { dns: 0, connect: 0, ssl: 0, send: 0.1, wait: 100.0, receive: 199.9 },
      },
      {
        pageref: 'page_1',
        startedDateTime: '2024-01-01T00:00:00.400Z',
        time: 150,
        request: { url: 'https://d1234.cloudfront.net/bundle.js', method: 'GET', headers: [], queryString: [], cookies: [], headersSize: -1, bodySize: 0 },
        response: { status: 200, statusText: 'OK', headers: [], cookies: [], content: { mimeType: 'application/javascript', size: 0 }, redirectURL: '', headersSize: -1, bodySize: 45000 },
        timings: { dns: 5.0, connect: 10.0, ssl: 8.0, send: 0.1, wait: 80.0, receive: 46.9 },
      },
    ],
  },
})

describe('extractNetworkSignals', () => {
  beforeEach(() => {
    mockReadFile.mockResolvedValue(FIXTURE_HAR)
    mockUnlink.mockResolvedValue(undefined)
  })

  it('returns correct totalRequests', async () => {
    const signals = await extractNetworkSignals(FIXTURE_PATH)
    expect(signals.totalRequests).toBe(4)
  })

  it('detects firstRequestTTFB from HTML document', async () => {
    const signals = await extractNetworkSignals(FIXTURE_PATH)
    expect(signals.firstRequestTTFB).toBeCloseTo(89.3, 0)
  })

  it('detects render-blocking CSS (and CDN JS)', async () => {
    const signals = await extractNetworkSignals(FIXTURE_PATH)
    // CSS + CDN JS are both render-blocking (no async/defer in URL, on first page)
    expect(signals.renderBlockingCount).toBeGreaterThanOrEqual(1)
    expect(signals.renderBlockingAssets.some((a) => a.includes('styles.css'))).toBe(true)
  })

  it('detects oversized JPEG image', async () => {
    const signals = await extractNetworkSignals(FIXTURE_PATH)
    expect(signals.imageCount).toBe(1)
    expect(signals.oversizedImageCount).toBe(1)
    expect(signals.totalImageBytes).toBe(153600)
  })

  it('detects CDN (cloudfront.net) entry', async () => {
    const signals = await extractNetworkSignals(FIXTURE_PATH)
    expect(signals.cdnCount).toBe(1)
    const cdnEntry = signals.entries.find((e) => e.url.includes('cloudfront.net'))
    expect(cdnEntry?.cdnProvider).toBe('cloudfront.net')
  })

  it('populates HAREntry timings correctly', async () => {
    const signals = await extractNetworkSignals(FIXTURE_PATH)
    const htmlEntry = signals.entries.find((e) => e.mimeType.includes('html'))
    expect(htmlEntry).toBeDefined()
    expect(htmlEntry!.timings.dns).toBeCloseTo(12.1, 1)
    expect(htmlEntry!.timings.connect).toBeCloseTo(34.5, 1)
    expect(htmlEntry!.timings.wait).toBeCloseTo(89.3, 1)
  })

  it('calls fs.unlink to clean up the HAR file', async () => {
    await extractNetworkSignals(FIXTURE_PATH)
    expect(mockUnlink).toHaveBeenCalledWith(FIXTURE_PATH)
  })
})
