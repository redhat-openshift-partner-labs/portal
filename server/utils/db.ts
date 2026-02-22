import { PrismaClient } from '@prisma/client'

// Use a singleton pattern to avoid creating multiple Prisma clients
// during hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalThis.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// For backwards compatibility, export a getDb function
export function getDb(): PrismaClient {
  return prisma
}
