// src/lib/ssrf.test.ts
import { describe, it, expect, vi } from 'vitest'
import { validateUrl } from './ssrf'

// Mock dns module — no real network calls in unit tests
vi.mock('node:dns', () => ({
  default: {
    promises: {
      lookup: vi.fn(),
    },
  },
  promises: {
    lookup: vi.fn(),
  },
}))

import dns from 'node:dns'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLookup = vi.mocked(dns.promises.lookup as any)

describe('validateUrl', () => {
  it('allows a valid public URL', async () => {
    mockLookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }])
    await expect(validateUrl('https://example.com')).resolves.toBeUndefined()
  })

  it('blocks RFC-1918 private IP (10.x.x.x)', async () => {
    mockLookup.mockResolvedValue([{ address: '10.0.0.1', family: 4 }])
    await expect(validateUrl('https://internal.example.com')).rejects.toMatchObject({
      code: 'BLOCKED_IP',
    })
  })

  it('blocks RFC-1918 private IP (172.16.x.x)', async () => {
    mockLookup.mockResolvedValue([{ address: '172.16.0.1', family: 4 }])
    await expect(validateUrl('https://internal.example.com')).rejects.toMatchObject({
      code: 'BLOCKED_IP',
    })
  })

  it('blocks RFC-1918 private IP (192.168.x.x)', async () => {
    mockLookup.mockResolvedValue([{ address: '192.168.1.1', family: 4 }])
    await expect(validateUrl('https://internal.example.com')).rejects.toMatchObject({
      code: 'BLOCKED_IP',
    })
  })

  it('blocks localhost (127.0.0.1)', async () => {
    mockLookup.mockResolvedValue([{ address: '127.0.0.1', family: 4 }])
    await expect(validateUrl('http://localhost')).rejects.toMatchObject({
      code: 'BLOCKED_IP',
    })
  })

  it('blocks link-local / cloud metadata (169.254.x.x)', async () => {
    mockLookup.mockResolvedValue([{ address: '169.254.169.254', family: 4 }])
    await expect(validateUrl('http://metadata.example.com')).rejects.toMatchObject({
      code: 'BLOCKED_IP',
    })
  })

  it('blocks non-http schemes (file://)', async () => {
    await expect(validateUrl('file:///etc/passwd')).rejects.toMatchObject({
      code: 'BLOCKED_SCHEME',
    })
  })

  it('blocks non-http schemes (ftp://)', async () => {
    await expect(validateUrl('ftp://example.com/file')).rejects.toMatchObject({
      code: 'BLOCKED_SCHEME',
    })
  })

  it('blocks IPv6 loopback (::1)', async () => {
    mockLookup.mockResolvedValue([{ address: '::1', family: 6 }])
    await expect(validateUrl('http://example.com')).rejects.toMatchObject({
      code: 'BLOCKED_IP',
    })
  })
})
