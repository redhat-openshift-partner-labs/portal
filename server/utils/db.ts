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

    // Build proper connection string if only hostname was provided
    let connectionString = databaseUrl
    if (!databaseUrl.startsWith('postgres') && !databaseUrl.includes('://')) {
      connectionString = `postgresql://postgres:postgres@${databaseUrl}:5432/portal`
    }

    // Enable SSL for production PostgreSQL connections
    // Use rejectUnauthorized: false for self-signed certificates
    // For strict SSL validation, set NODE_EXTRA_CA_CERTS or use --use-openssl-ca
    return new PrismaPg({
      connectionString,
      ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    })
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
