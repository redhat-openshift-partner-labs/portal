import { PrismaClient } from '../../generated/prisma/client.js'

declare global {
  var __prisma: PrismaClient | undefined
}

function createAdapter() {
  const databaseUrl = process.env.DATABASE_URL || ''
  const isProduction = process.env.NODE_ENV === 'production'

  // In production, always use PostgreSQL
  if (isProduction) {
    // Dynamic import to ensure proper bundling
    const { PrismaPg } = require('@prisma/adapter-pg')

    // Build proper connection string if only hostname was provided
    let connectionString = databaseUrl
    if (!databaseUrl.startsWith('postgres') && !databaseUrl.includes('://')) {
      // Assume it's just a hostname, build full connection string
      connectionString = `postgresql://postgres:postgres@${databaseUrl}:5432/portal`
    }
    return new PrismaPg({ connectionString })
  }

  // Development: check URL format
  if (databaseUrl.startsWith('postgres')) {
    const { PrismaPg } = require('@prisma/adapter-pg')
    return new PrismaPg({ connectionString: databaseUrl })
  }

  // Local development with SQLite
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
  return new PrismaBetterSqlite3({ url: databaseUrl || 'file:./prisma/dev.db' })
}

function createPrismaClient(): PrismaClient {
  const adapter = createAdapter()
  return new PrismaClient({ adapter })
}

export const prisma = globalThis.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

export function getDb(): PrismaClient {
  return prisma
}
