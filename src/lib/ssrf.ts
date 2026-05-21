// src/lib/ssrf.ts
// Source: nodejs.org/api/dns.html + OWASP SSRF Prevention Cheat Sheet

import dns from 'node:dns'

const BLOCKED_RANGES: Array<(parts: number[]) => boolean> = [
  // Loopback: 127.0.0.0/8
  (p) => p[0] === 127,
  // RFC-1918: 10.0.0.0/8
  (p) => p[0] === 10,
  // RFC-1918: 172.16.0.0/12
  (p) => p[0] === 172 && p[1] >= 16 && p[1] <= 31,
  // RFC-1918: 192.168.0.0/16
  (p) => p[0] === 192 && p[1] === 168,
  // Link-local / APIPA / cloud metadata: 169.254.0.0/16
  (p) => p[0] === 169 && p[1] === 254,
  // Unspecified: 0.0.0.0
  (p) => p[0] === 0,
]

export class SsrfError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'BLOCKED_SCHEME'
      | 'INVALID_URL'
      | 'DNS_RESOLUTION_FAILED'
      | 'BLOCKED_IP',
  ) {
    super(message)
    this.name = 'SsrfError'
  }
}

export async function validateUrl(rawUrl: string): Promise<void> {
  // 1. Parse URL and enforce scheme
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new SsrfError('Invalid URL format', 'INVALID_URL')
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new SsrfError(
      `Scheme "${parsed.protocol}" is not allowed`,
      'BLOCKED_SCHEME',
    )
  }

  const hostname = parsed.hostname

  // 2. Resolve hostname to all IP addresses (catches 0.0.0.0, decimal encoding, etc.)
  let addresses: dns.LookupAddress[]
  try {
    // { all: true } returns every resolved address — critical for multi-A-record hosts
    addresses = await dns.promises.lookup(hostname, { all: true })
  } catch {
    throw new SsrfError(
      `Could not resolve hostname "${hostname}"`,
      'DNS_RESOLUTION_FAILED',
    )
  }

  for (const { address, family } of addresses) {
    if (family === 4) {
      const parts = address.split('.').map(Number)
      if (BLOCKED_RANGES.some((check) => check(parts))) {
        throw new SsrfError(
          `Hostname "${hostname}" resolves to a blocked IP address`,
          'BLOCKED_IP',
        )
      }
    }

    if (family === 6) {
      // Block IPv6 loopback (::1) and link-local (fe80::/10)
      if (address === '::1' || address.toLowerCase().startsWith('fe80:')) {
        throw new SsrfError(
          `Hostname "${hostname}" resolves to a blocked IPv6 address`,
          'BLOCKED_IP',
        )
      }
    }
  }
}
