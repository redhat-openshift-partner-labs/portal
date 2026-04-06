/**
 * PostgreSQL seed script for staging environment
 *
 * Usage:
 *   DATABASE_URL=postgresql://... pnpm db:pg:seed
 *
 * This script populates the staging database with synthetic data
 * for smoke testing deployments.
 */
import { PrismaClient } from '../generated/prisma-pg/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { randomUUID } from 'crypto'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Helper to generate random lab name
function generateLabName(): string {
  const adjectives = ['swift', 'bright', 'calm', 'deep', 'eager', 'fair', 'keen', 'prime', 'true', 'wise']
  const nouns = ['lab', 'cloud', 'stack', 'node', 'core', 'zone', 'hub', 'pod', 'grid', 'mesh']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 9000) + 1000
  return `${adj}-${noun}-${num}`
}

async function main() {
  console.log('Seeding PostgreSQL database...')

  // Clear existing data (in order of dependencies)
  await prisma.audit.deleteMany()
  await prisma.extensionRequest.deleteMany()
  await prisma.note.deleteMany()
  await prisma.lab.deleteMany()
  await prisma.cloudCost.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()
  await prisma.openshiftVersionMapping.deleteMany()

  // Create companies
  const companyData = [
    { companyName: 'Acme Corp', curated: true },
    { companyName: 'TechFlow', curated: true },
    { companyName: 'CloudNine', curated: false },
    { companyName: 'DataDriven', curated: true },
    { companyName: 'SecureNet', curated: false },
    { companyName: 'InnovateLabs', curated: true },
    { companyName: 'ScaleUp', curated: false },
    { companyName: 'DevOps Pro', curated: true },
    { companyName: 'CloudStack', curated: false },
    { companyName: 'NetSolutions', curated: true },
    { companyName: 'CodeCraft', curated: false },
    { companyName: 'SystemsPlus', curated: true },
  ]

  const companies = await Promise.all(
    companyData.map(c => prisma.company.create({ data: c })),
  )
  console.log(`Created ${companies.length} companies`)

  // Create users with firstName, lastName, fullName
  const userNames = [
    { firstName: 'John', lastName: 'Smith' },
    { firstName: 'Sarah', lastName: 'Johnson' },
    { firstName: 'Michael', lastName: 'Williams' },
    { firstName: 'Emily', lastName: 'Brown' },
    { firstName: 'David', lastName: 'Jones' },
    { firstName: 'Lisa', lastName: 'Garcia' },
    { firstName: 'James', lastName: 'Miller' },
    { firstName: 'Jennifer', lastName: 'Davis' },
    { firstName: 'Robert', lastName: 'Martinez' },
    { firstName: 'Maria', lastName: 'Anderson' },
  ]

  const users = await Promise.all(
    userNames.map((u, i) =>
      prisma.user.create({
        data: {
          userId: `user-${i + 1}`,
          email: `${u.firstName.toLowerCase()}.${u.lastName.toLowerCase()}@example.com`,
          firstName: u.firstName,
          lastName: u.lastName,
          fullName: `${u.firstName} ${u.lastName}`,
          admin: i < 2, // First two users are admins
          group: i === 0 ? 'oplmgr' : i === 1 ? 'opldev' : null,
        },
      }),
    ),
  )
  console.log(`Created ${users.length} users`)

  // Create OpenShift version mappings
  const versions = [
    { name: '4.14.0', location: 'stable', rosa: true, aro: true, gro: false, roks: true },
    { name: '4.14.1', location: 'stable', rosa: true, aro: true, gro: true, roks: true },
    { name: '4.15.0', location: 'stable', rosa: true, aro: false, gro: true, roks: true },
    { name: '4.15.1', location: 'stable', rosa: true, aro: true, gro: true, roks: true },
    { name: '4.16.0', location: 'candidate', rosa: true, aro: false, gro: false, roks: false },
  ]

  await Promise.all(
    versions.map(v => prisma.openshiftVersionMapping.create({ data: v })),
  )
  console.log(`Created ${versions.length} OpenShift version mappings`)

  // Create labs (merged with requests)
  const states = ['Pending', 'Approved', 'Running', 'Hibernating', 'Denied', 'Completed']
  const cloudProviders = ['AWS', 'Azure', 'GCP', 'IBM']
  const regions = ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Singapore', 'Asia/Tokyo']
  const clusterSizes = ['small', 'medium', 'large']
  const requestTypes = ['POC', 'Demo', 'Training', 'Dev']
  const leaseOptions = ['1w', '2w', '1m', '3m']
  const openshiftVersions = ['4.14.0', '4.14.1', '4.15.0', '4.15.1']

  const now = new Date()
  const generatedNames = new Set<string>()

  const labs = await Promise.all(
    Array.from({ length: 50 }, () => {
      const company = companies[Math.floor(Math.random() * companies.length)]!
      const state = states[Math.floor(Math.random() * states.length)]!
      const startDaysAgo = Math.floor(Math.random() * 60) + 1
      const durationDays = Math.floor(Math.random() * 90) + 14
      const startDate = new Date(now.getTime() - startDaysAgo * 24 * 60 * 60 * 1000)
      const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000)

      // Ensure unique generated name
      let genName = generateLabName()
      while (generatedNames.has(genName)) {
        genName = generateLabName()
      }
      generatedNames.add(genName)

      const primaryUser = users[Math.floor(Math.random() * users.length)]!
      const secondaryUser = users[Math.floor(Math.random() * users.length)]!

      return prisma.lab.create({
        data: {
          clusterId: randomUUID(),
          generatedName: genName,
          state,
          clusterName: `opl-${genName}`,
          openshiftVersion: openshiftVersions[Math.floor(Math.random() * openshiftVersions.length)]!,
          clusterSize: clusterSizes[Math.floor(Math.random() * clusterSizes.length)]!,
          companyName: company.companyName,
          companyId: company.id,
          requestType: requestTypes[Math.floor(Math.random() * requestTypes.length)]!,
          partner: Math.random() > 0.3,
          sponsor: users[Math.floor(Math.random() * users.length)]!.fullName || 'Unknown Sponsor',
          cloudProvider: cloudProviders[Math.floor(Math.random() * cloudProviders.length)]!,
          primaryFirst: primaryUser.firstName || 'Primary',
          primaryLast: primaryUser.lastName || 'Contact',
          primaryEmail: primaryUser.email,
          secondaryFirst: secondaryUser.firstName || 'Secondary',
          secondaryLast: secondaryUser.lastName || 'Contact',
          secondaryEmail: secondaryUser.email,
          region: regions[Math.floor(Math.random() * regions.length)]!,
          alwaysOn: Math.random() > 0.7,
          projectName: `project-${genName}`,
          leaseTime: leaseOptions[Math.floor(Math.random() * leaseOptions.length)]!,
          description: `Lab environment for ${company.companyName} - ${requestTypes[Math.floor(Math.random() * requestTypes.length)]} use case`,
          notes: Math.random() > 0.5 ? 'Internal notes for this lab' : '',
          startDate,
          endDate,
          hold: Math.random() > 0.9,
          createdAt: startDate,
        },
      })
    }),
  )
  console.log(`Created ${labs.length} labs`)

  // Create CloudCost records for the last 18 months
  const cloudCosts = await Promise.all(
    Array.from({ length: 18 }, (_, monthsAgo) => {
      const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
      const month = date.getMonth() + 1 // 1-indexed month
      const year = date.getFullYear()

      // Create cost records for each provider
      return Promise.all(
        cloudProviders.map(provider =>
          prisma.cloudCost.create({
            data: {
              month,
              year,
              provider,
              cost: 5000 + Math.random() * 15000, // $5k to $20k per provider
            },
          }),
        ),
      )
    }),
  )
  console.log(`Created ${cloudCosts.flat().length} cloud cost records`)

  // Create notes for labs
  const noteContents = [
    'Initial setup completed successfully.',
    'Cluster is ready for workshop participants.',
    'Extended reservation as per customer request.',
    'Monitoring shows stable performance.',
    'Added additional storage quota.',
    'Customer reported minor connectivity issue - resolved.',
    'Scheduled maintenance window next week.',
    'Upgraded to latest OpenShift version.',
  ]

  const notes = await Promise.all(
    Array.from({ length: 40 }, () => {
      const lab = labs[Math.floor(Math.random() * labs.length)]!
      const user = users[Math.floor(Math.random() * users.length)]!
      const content = noteContents[Math.floor(Math.random() * noteContents.length)]!
      const createdDaysAgo = Math.floor(Math.random() * 14)
      const createdAt = new Date(now.getTime() - createdDaysAgo * 24 * 60 * 60 * 1000)

      return prisma.note.create({
        data: {
          labId: lab.id,
          note: content,
          userId: user.email,
          immutable: Math.random() > 0.8,
          createdAt,
        },
      })
    }),
  )
  console.log(`Created ${notes.length} notes`)

  // Create some extension requests
  const extensionRequests = await Promise.all(
    Array.from({ length: 20 }, () => {
      const lab = labs[Math.floor(Math.random() * labs.length)]!
      const user = users[Math.floor(Math.random() * users.length)]!
      const extensions = ['3d', '1w', '2w', '1mo']
      const statuses = ['Pending', 'Approved', 'Denied']
      const createdDaysAgo = Math.floor(Math.random() * 30)

      return prisma.extensionRequest.create({
        data: {
          labId: lab.id,
          extension: extensions[Math.floor(Math.random() * extensions.length)],
          currentUser: user.email,
          date: new Date(now.getTime() - createdDaysAgo * 24 * 60 * 60 * 1000),
          status: statuses[Math.floor(Math.random() * statuses.length)],
        },
      })
    }),
  )
  console.log(`Created ${extensionRequests.length} extension requests`)

  // Create some audit records
  const audits = await Promise.all(
    Array.from({ length: 100 }, () => {
      const lab = labs[Math.floor(Math.random() * labs.length)]!
      const user = users[Math.floor(Math.random() * users.length)]!
      const loginTypes = ['console', 'api', 'oc-cli']
      const accessDaysAgo = Math.floor(Math.random() * 30)

      return prisma.audit.create({
        data: {
          generatedName: lab.generatedName,
          accessTime: new Date(now.getTime() - accessDaysAgo * 24 * 60 * 60 * 1000),
          loginName: user.email,
          loginType: loginTypes[Math.floor(Math.random() * loginTypes.length)],
        },
      })
    }),
  )
  console.log(`Created ${audits.length} audit records`)

  console.log('PostgreSQL database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
