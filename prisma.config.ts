// prisma.config.ts  (project root)
// Source: .planning/phases/01-data-foundation-and-security-baseline/01-RESEARCH.md Pattern 1
// Uses DIRECT_URL (port 5432, no pooler) for migrations only.
// Runtime DB access uses DATABASE_URL (pooler, port 6543) via PrismaNeon adapter in src/lib/prisma.ts.

import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL'),
  },
})
