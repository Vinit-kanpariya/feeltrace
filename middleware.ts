// middleware.ts  (project root — runs as Vercel Edge Middleware)
// Source: .planning/phases/01-data-foundation-and-security-baseline/01-RESEARCH.md Pattern 5
//
// Two sliding window rate limiters (hourly + daily) per IP (D-06).
// Uses the shared Redis singleton from src/lib/redis.ts (D-07 — separate Upstash Redis DB).
//
// T-01-16: Prevents mass job submissions from a single IP.
// T-01-17: request.ip is set by Vercel infrastructure — cannot be spoofed via X-Forwarded-For.
// T-01-18: Two SEPARATE Ratelimit instances enforce independent hourly and daily windows.

import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'

// D-06: 5 requests per IP per hour
const hourlyLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'rl:hourly',
})

// D-06: 20 requests per IP per day
const dailyLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 d'),
  prefix: 'rl:daily',
})

export async function middleware(
  request: NextRequest,
  _event: NextFetchEvent,
): Promise<Response | undefined> {
  // Pitfall 3: request.ip is undefined in local dev — fall back to 127.0.0.1
  // Note: request.ip exists at runtime on Vercel Edge but is not in the Next.js 15 type
  // definition. Cast to access it safely.
  const ip =
    (request as NextRequest & { ip?: string }).ip ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    '127.0.0.1'

  // Check hourly limit first (stricter constraint — D-06)
  const hourly = await hourlyLimiter.limit(ip)
  if (!hourly.success) {
    const retryAfter = Math.ceil((hourly.reset - Date.now()) / 1000)
    const minutes = Math.ceil(retryAfter / 60)
    return new Response(`Too many requests. Try again in ${minutes} minutes.`, {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'Content-Type': 'text/plain',
      },
    })
  }

  // Check daily limit (D-06, D-08)
  const daily = await dailyLimiter.limit(ip)
  if (!daily.success) {
    const retryAfter = Math.ceil((daily.reset - Date.now()) / 1000)
    const hours = Math.ceil(retryAfter / 3600)
    return new Response(
      `Too many requests. Daily limit reached. Try again in ${hours} hours.`,
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'Content-Type': 'text/plain',
        },
      },
    )
  }

  return NextResponse.next()
}

// D-06: Only apply rate limiting to the analyze endpoint — all other routes are unaffected
export const config = {
  matcher: '/api/analyze',
}
