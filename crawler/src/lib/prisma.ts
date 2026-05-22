// crawler/src/lib/prisma.ts
// Standard PrismaClient — no @prisma/adapter-neon needed for Docker/Railway.
// Railway is a persistent TCP process; standard PrismaClient with pooler URL is
// more efficient than the serverless WebSocket adapter (D-22).
//
// DATABASE_URL format: postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
// Use the -pooler URL (PgBouncer) to avoid exhausting Neon's connection limit
// across multiple job processing cycles.
//
// Source: RESEARCH.md Pattern 6

import { PrismaClient } from '../generated/prisma'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
