import { PrismaClient } from '../../generated/prisma/client.js'

declare global {
  var __prisma: PrismaClient | undefined
}

const isProduction = process.env.NODE_ENV === 'production'

async function createAdapter() {
  const databaseUrl = process.env.DATABASE_URL || ''

  // In production, always use PostgreSQL
  if (isProduction || databaseUrl.startsWith('postgres')) {
    const { PrismaPg } = await import('@prisma/adapter-pg')
    const { Pool } = await import('pg')

    // Build proper connection string if only hostname was provided
    let connectionString = databaseUrl
    if (!databaseUrl.startsWith('postgres') && !databaseUrl.includes('://')) {
      connectionString = `postgresql://postgres:postgres@${databaseUrl}:5432/portal`
    }

    // Extract schema from connection string (e.g., ?schema=portaladmin)
    // Default to 'public' if not specified
    const url = new URL(connectionString)
    const schema = url.searchParams.get('schema') || 'public'

    // Create pg Pool with explicit search_path
    // This is required because @prisma/adapter-pg ignores the ?schema= parameter
    // See: https://github.com/prisma/prisma/issues/28611
    const pool = new Pool({
      connectionString,
      ssl: isProduction ? { rejectUnauthorized: false } : undefined,
      options: `-c search_path="${schema}"`,
    })

    return new PrismaPg(pool, { schema })
  }

  // Local development with SQLite
  const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3')
  return new PrismaBetterSqlite3({ url: databaseUrl || 'file:./prisma/dev.db' })
}

async function createPrismaClient(): Promise<PrismaClient> {
  const adapter = await createAdapter()
  return new PrismaClient({ adapter })
}

// Lazy initialization with caching
let prismaPromise: Promise<PrismaClient> | null = null

export async function getDb(): Promise<PrismaClient> {
  if (globalThis.__prisma) {
    return globalThis.__prisma
  }

  if (!prismaPromise) {
    prismaPromise = createPrismaClient().then((client) => {
      if (!isProduction) {
        globalThis.__prisma = client
      }
      return client
    })
  }

  return prismaPromise
}

// Legacy export - will throw helpful error if used directly
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    throw new Error(
      `Cannot use 'prisma.${String(prop)}' directly. Use 'const db = await getDb()' instead.`
    )
  },
})
