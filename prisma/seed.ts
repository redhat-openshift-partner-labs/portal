import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.session.deleteMany()
  await prisma.cost.deleteMany()
  await prisma.lab.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()

  // Create companies
  const companies = await Promise.all([
    prisma.company.create({ data: { name: 'Acme Corp' } }),
    prisma.company.create({ data: { name: 'TechFlow' } }),
    prisma.company.create({ data: { name: 'CloudNine' } }),
    prisma.company.create({ data: { name: 'DataDriven' } }),
    prisma.company.create({ data: { name: 'SecureNet' } }),
    prisma.company.create({ data: { name: 'InnovateLabs' } }),
    prisma.company.create({ data: { name: 'ScaleUp' } }),
    prisma.company.create({ data: { name: 'DevOps Pro' } }),
    prisma.company.create({ data: { name: 'CloudStack' } }),
    prisma.company.create({ data: { name: 'NetSolutions' } }),
    prisma.company.create({ data: { name: 'CodeCraft' } }),
    prisma.company.create({ data: { name: 'SystemsPlus' } }),
  ])
  console.log(`Created ${companies.length} companies`)

  // Create users
  const users = await Promise.all(
    Array.from({ length: 50 }, (_, i) =>
      prisma.user.create({
        data: {
          email: `user${i + 1}@example.com`,
          name: `User ${i + 1}`,
        },
      })
    )
  )
  console.log(`Created ${users.length} users`)

  // Create labs
  const labStatuses = ['pending', 'active', 'completed', 'archived']
  const now = new Date()

  const labs = await Promise.all(
    Array.from({ length: 100 }, (_, i) => {
      const status = labStatuses[Math.floor(Math.random() * labStatuses.length)]
      const createdMonthsAgo = Math.floor(Math.random() * 12)
      const createdAt = new Date(now.getFullYear(), now.getMonth() - createdMonthsAgo, Math.floor(Math.random() * 28) + 1)
      const completedAt = status === 'completed'
        ? new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000)
        : null

      return prisma.lab.create({
        data: {
          name: `Lab ${i + 1}: OpenShift Workshop`,
          description: `Workshop covering OpenShift fundamentals and deployment`,
          status,
          createdAt,
          completedAt,
        },
      })
    })
  )
  console.log(`Created ${labs.length} labs`)

  // Create sessions
  const sessions = await Promise.all(
    Array.from({ length: 200 }, (_, i) => {
      const user = users[Math.floor(Math.random() * users.length)]
      const lab = labs[Math.floor(Math.random() * labs.length)]
      const completed = Math.random() > 0.3
      const startedMonthsAgo = Math.floor(Math.random() * 6)
      const startedAt = new Date(now.getFullYear(), now.getMonth() - startedMonthsAgo, Math.floor(Math.random() * 28) + 1)
      const completedAt = completed
        ? new Date(startedAt.getTime() + Math.random() * 4 * 60 * 60 * 1000)
        : null

      return prisma.session.create({
        data: {
          userId: user.id,
          labId: lab.id,
          completed,
          startedAt,
          completedAt,
        },
      })
    })
  )
  console.log(`Created ${sessions.length} sessions`)

  // Create costs for the last 18 months
  const costs = await Promise.all(
    Array.from({ length: 18 }, (_, monthsAgo) => {
      const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 15)
      // Random cost between $20k and $60k
      const amount = 20000 + Math.random() * 40000

      return prisma.cost.create({
        data: {
          amount,
          date,
          category: 'infrastructure',
        },
      })
    })
  )
  console.log(`Created ${costs.length} cost records`)

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
