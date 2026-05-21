// src/lib/redis.ts
// Source: .planning/phases/01-data-foundation-and-security-baseline/01-RESEARCH.md Pattern 5
// Upstash Redis client for IP-based rate limiting in Vercel Edge Middleware.
//
// D-07: This is a SEPARATE Upstash Redis database from the QStash instance.
//       Same Upstash account, different database. Keeps rate limit counters isolated.
//
// This same instance is imported by middleware.ts (two Ratelimit instances: hourly + daily).
// Using explicit constructor (not Redis.fromEnv()) makes env var names visible and explicit (D-07).
//
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are server-side secrets (T-01-08).
// NEVER expose via NEXT_PUBLIC_ prefix or return in any API response.

import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
