// prisma.config.ts  (project root)
// Source: .planning/phases/01-data-foundation-and-security-baseline/01-RESEARCH.md Pattern 1
// Uses DIRECT_URL (port 5432, no pooler) for migrations only.
// Runtime DB access uses DATABASE_URL (pooler, port 6543) via PrismaNeon adapter in src/lib/prisma.ts.

import dotenv from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Next.js uses .env.local; dotenv/config only reads .env by default.
// Load .env.local first, then fall back to .env for CI/production.
dotenv.config({ path: '.env.local' })
dotenv.config()

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL'),
  },
})
