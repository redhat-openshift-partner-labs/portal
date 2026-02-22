import { PrismaClient } from '../../generated/prisma/client.js'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  var __prisma: PrismaClient | undefined
}

function createAdapter() {
  const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'

  // Use PostgreSQL adapter if URL starts with postgres/postgresql
  if (databaseUrl.startsWith('postgres')) {
    return new PrismaPg({
      connectionString: databaseUrl,
    })
  }

  // Default to SQLite for local development
  return new PrismaBetterSqlite3({
    url: databaseUrl,
  })
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
