// src/lib/prisma.ts
// Source: .planning/phases/01-data-foundation-and-security-baseline/01-RESEARCH.md Pattern 1
// Singleton pattern prevents multiple Prisma Client instances during Next.js hot reload.
//
// IMPORTANT — Prisma 7 import path:
//   Import from '../generated/prisma' (NOT '@prisma/client') — Pitfall 1 in RESEARCH.md.
//   The generated client is emitted to src/generated/prisma by `prisma generate` / `prisma db push`.
//
// DATABASE_URL must use the Neon pooler hostname (contains -pooler, port 6543).
// Using the direct URL here would exhaust Neon's free-tier connection limit under load (Pitfall 2).

import { PrismaClient } from '../generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!, // pooler URL (port 6543, -pooler hostname suffix)
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Cache the client on the global object in development to survive hot reloads.
// In production, the module is only loaded once so this guard is not needed.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
