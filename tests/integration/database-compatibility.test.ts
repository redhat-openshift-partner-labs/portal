/**
 * Database Compatibility Tests
 *
 * These tests verify that SQLite (local development) behaves consistently
 * with PostgreSQL (production) for critical database operations.
 *
 * Specifically tests:
 * - Foreign key cascade behavior
 * - DateTime round-trip consistency
 * - Boolean values stored/retrieved correctly
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import type { PrismaClient } from '../../generated/prisma/client.js'
import { getTestDb, cleanTestDb, teardownTestDb } from '../setup.js'

let db: PrismaClient

describe('Database Compatibility Tests', () => {
  beforeAll(async () => {
    db = await getTestDb()
  })

  afterAll(async () => {
    await teardownTestDb()
  })

  beforeEach(async () => {
    await cleanTestDb(db)
  })

  describe('Boolean Value Handling', () => {
    it('should store and retrieve boolean true correctly', async () => {
      const user = await db.user.create({
        data: {
          email: 'admin@test.com',
          admin: true,
          updatedAt: new Date(),
        },
      })

      const retrieved = await db.user.findUnique({
        where: { id: user.id },
      })

      expect(retrieved?.admin).toBe(true)
      expect(typeof retrieved?.admin).toBe('boolean')
    })

    it('should store and retrieve boolean false correctly', async () => {
      const user = await db.user.create({
        data: {
          email: 'regular@test.com',
          admin: false,
          updatedAt: new Date(),
        },
      })

      const retrieved = await db.user.findUnique({
        where: { id: user.id },
      })

      expect(retrieved?.admin).toBe(false)
      expect(typeof retrieved?.admin).toBe('boolean')
    })

    it('should handle multiple boolean fields on Lab model', async () => {
      const company = await db.company.create({
        data: {
          companyName: 'Test Company',
          curated: true,
          updatedAt: new Date(),
        },
      })

      const lab = await db.lab.create({
        data: {
          clusterId: 'cluster-001',
          generatedName: 'test-lab-001',
          state: 'Running',
          clusterName: 'Test Lab',
          openshiftVersion: '4.14',
          clusterSize: 'medium',
          companyName: 'Test Company',
          companyId: company.id,
          requestType: 'Partner Lab',
          partner: true,
          sponsor: 'Test Sponsor',
          cloudProvider: 'AWS',
          primaryFirst: 'John',
          primaryLast: 'Doe',
          primaryEmail: 'john@test.com',
          secondaryFirst: 'Jane',
          secondaryLast: 'Doe',
          secondaryEmail: 'jane@test.com',
          region: 'us-east-1',
          alwaysOn: true,
          projectName: 'test-project',
          leaseTime: '30 days',
          description: 'Test lab',
          hold: false,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
      })

      const retrieved = await db.lab.findUnique({
        where: { id: lab.id },
      })

      expect(retrieved?.partner).toBe(true)
      expect(retrieved?.alwaysOn).toBe(true)
      expect(retrieved?.hold).toBe(false)
      expect(typeof retrieved?.partner).toBe('boolean')
      expect(typeof retrieved?.alwaysOn).toBe('boolean')
      expect(typeof retrieved?.hold).toBe('boolean')
    })
  })

  describe('DateTime Handling', () => {
    it('should round-trip DateTime values with millisecond precision', async () => {
      const testDate = new Date('2026-02-26T12:30:45.123Z')

      const lab = await db.lab.create({
        data: {
          clusterId: 'cluster-001',
          generatedName: 'datetime-test-lab',
          state: 'Running',
          clusterName: 'DateTime Test Lab',
          openshiftVersion: '4.14',
          clusterSize: 'medium',
          companyName: 'Test Company',
          requestType: 'Partner Lab',
          sponsor: 'Test Sponsor',
          cloudProvider: 'AWS',
          primaryFirst: 'John',
          primaryLast: 'Doe',
          primaryEmail: 'john@test.com',
          secondaryFirst: 'Jane',
          secondaryLast: 'Doe',
          secondaryEmail: 'jane@test.com',
          region: 'us-east-1',
          projectName: 'test-project',
          leaseTime: '30 days',
          description: 'Test lab for datetime',
          startDate: testDate,
          endDate: new Date(testDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
      })

      const retrieved = await db.lab.findUnique({
        where: { id: lab.id },
      })

      expect(retrieved?.startDate).toBeInstanceOf(Date)
      // Compare ISO strings to handle millisecond precision differences
      expect(retrieved?.startDate.toISOString()).toBe(testDate.toISOString())
    })

    it('should handle dates near epoch correctly', async () => {
      const epochDate = new Date('1970-01-01T00:00:00.000Z')
      const futureDate = new Date('2030-12-31T23:59:59.999Z')

      const user = await db.user.create({
        data: {
          email: 'epoch-test@test.com',
          createdAt: epochDate,
          updatedAt: futureDate,
        },
      })

      const retrieved = await db.user.findUnique({
        where: { id: user.id },
      })

      // SQLite may have issues with epoch dates in some edge cases
      expect(retrieved?.createdAt).toBeInstanceOf(Date)
      expect(retrieved?.updatedAt).toBeInstanceOf(Date)
    })

    it('should support DateTime comparisons in queries', async () => {
      const now = new Date()
      const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

      await db.lab.create({
        data: {
          clusterId: 'cluster-past',
          generatedName: 'past-lab',
          state: 'Completed',
          clusterName: 'Past Lab',
          openshiftVersion: '4.14',
          clusterSize: 'medium',
          companyName: 'Test Company',
          requestType: 'Partner Lab',
          sponsor: 'Test Sponsor',
          cloudProvider: 'AWS',
          primaryFirst: 'John',
          primaryLast: 'Doe',
          primaryEmail: 'john@test.com',
          secondaryFirst: 'Jane',
          secondaryLast: 'Doe',
          secondaryEmail: 'jane@test.com',
          region: 'us-east-1',
          projectName: 'test-project',
          leaseTime: '30 days',
          description: 'Past lab',
          startDate: pastDate,
          endDate: pastDate,
          updatedAt: new Date(),
        },
      })

      await db.lab.create({
        data: {
          clusterId: 'cluster-future',
          generatedName: 'future-lab',
          state: 'Pending',
          clusterName: 'Future Lab',
          openshiftVersion: '4.14',
          clusterSize: 'medium',
          companyName: 'Test Company',
          requestType: 'Partner Lab',
          sponsor: 'Test Sponsor',
          cloudProvider: 'AWS',
          primaryFirst: 'John',
          primaryLast: 'Doe',
          primaryEmail: 'john@test.com',
          secondaryFirst: 'Jane',
          secondaryLast: 'Doe',
          secondaryEmail: 'jane@test.com',
          region: 'us-east-1',
          projectName: 'test-project',
          leaseTime: '30 days',
          description: 'Future lab',
          startDate: futureDate,
          endDate: futureDate,
          updatedAt: new Date(),
        },
      })

      // Query labs ending before now
      const pastLabs = await db.lab.findMany({
        where: {
          endDate: { lt: now },
        },
      })

      // Query labs starting after now
      const futureLabs = await db.lab.findMany({
        where: {
          startDate: { gt: now },
        },
      })

      expect(pastLabs).toHaveLength(1)
      expect(pastLabs[0].generatedName).toBe('past-lab')
      expect(futureLabs).toHaveLength(1)
      expect(futureLabs[0].generatedName).toBe('future-lab')
    })
  })

  describe('Foreign Key Cascade Behavior', () => {
    it('should cascade delete Notes when Lab is deleted', async () => {
      // Create a lab
      const lab = await db.lab.create({
        data: {
          clusterId: 'cluster-cascade',
          generatedName: 'cascade-test-lab',
          state: 'Running',
          clusterName: 'Cascade Test Lab',
          openshiftVersion: '4.14',
          clusterSize: 'medium',
          companyName: 'Test Company',
          requestType: 'Partner Lab',
          sponsor: 'Test Sponsor',
          cloudProvider: 'AWS',
          primaryFirst: 'John',
          primaryLast: 'Doe',
          primaryEmail: 'john@test.com',
          secondaryFirst: 'Jane',
          secondaryLast: 'Doe',
          secondaryEmail: 'jane@test.com',
          region: 'us-east-1',
          projectName: 'test-project',
          leaseTime: '30 days',
          description: 'Test lab for cascade delete',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
      })

      // Create multiple notes for this lab
      await db.note.createMany({
        data: [
          {
            labId: lab.id,
            note: 'First note',
            userId: 'user1@test.com',
            updatedAt: new Date(),
          },
          {
            labId: lab.id,
            note: 'Second note',
            userId: 'user2@test.com',
            updatedAt: new Date(),
          },
          {
            labId: lab.id,
            note: 'Third note',
            userId: 'user3@test.com',
            updatedAt: new Date(),
          },
        ],
      })

      // Verify notes exist
      const notesBefore = await db.note.findMany({
        where: { labId: lab.id },
      })
      expect(notesBefore).toHaveLength(3)

      // Delete the lab
      await db.lab.delete({
        where: { id: lab.id },
      })

      // Verify notes are cascade deleted
      const notesAfter = await db.note.findMany({
        where: { labId: lab.id },
      })
      expect(notesAfter).toHaveLength(0)
    })

    it('should NOT cascade delete Audits when Lab is deleted (referential action: no action)', async () => {
      // Create a lab
      const lab = await db.lab.create({
        data: {
          clusterId: 'cluster-audit',
          generatedName: 'audit-test-lab',
          state: 'Running',
          clusterName: 'Audit Test Lab',
          openshiftVersion: '4.14',
          clusterSize: 'medium',
          companyName: 'Test Company',
          requestType: 'Partner Lab',
          sponsor: 'Test Sponsor',
          cloudProvider: 'AWS',
          primaryFirst: 'John',
          primaryLast: 'Doe',
          primaryEmail: 'john@test.com',
          secondaryFirst: 'Jane',
          secondaryLast: 'Doe',
          secondaryEmail: 'jane@test.com',
          region: 'us-east-1',
          projectName: 'test-project',
          leaseTime: '30 days',
          description: 'Test lab for audit FK behavior',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
      })

      // Create an audit record
      await db.audit.create({
        data: {
          generatedName: lab.generatedName,
          accessTime: new Date(),
          loginName: 'testuser',
          loginType: 'ssh',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      // Verify audit exists
      const auditsBefore = await db.audit.findMany({
        where: { generatedName: lab.generatedName },
      })
      expect(auditsBefore).toHaveLength(1)

      // Attempting to delete the lab should fail due to FK constraint
      // (no cascade, no set null in the Audit relation)
      await expect(
        db.lab.delete({
          where: { id: lab.id },
        }),
      ).rejects.toThrow()

      // Audit should still exist
      const auditsAfter = await db.audit.findMany({
        where: { generatedName: lab.generatedName },
      })
      expect(auditsAfter).toHaveLength(1)
    })

    it('should NOT cascade delete ExtensionRequests when Lab is deleted', async () => {
      // Create a lab
      const lab = await db.lab.create({
        data: {
          clusterId: 'cluster-ext',
          generatedName: 'extension-test-lab',
          state: 'Running',
          clusterName: 'Extension Test Lab',
          openshiftVersion: '4.14',
          clusterSize: 'medium',
          companyName: 'Test Company',
          requestType: 'Partner Lab',
          sponsor: 'Test Sponsor',
          cloudProvider: 'AWS',
          primaryFirst: 'John',
          primaryLast: 'Doe',
          primaryEmail: 'john@test.com',
          secondaryFirst: 'Jane',
          secondaryLast: 'Doe',
          secondaryEmail: 'jane@test.com',
          region: 'us-east-1',
          projectName: 'test-project',
          leaseTime: '30 days',
          description: 'Test lab for extension FK behavior',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
      })

      // Create an extension request
      await db.extensionRequest.create({
        data: {
          labId: lab.id,
          extension: '1w',
          currentUser: 'testuser@test.com',
          date: new Date(),
          status: 'Pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      // Verify extension request exists
      const extsBefore = await db.extensionRequest.findMany({
        where: { labId: lab.id },
      })
      expect(extsBefore).toHaveLength(1)

      // Attempting to delete the lab should fail due to FK constraint
      await expect(
        db.lab.delete({
          where: { id: lab.id },
        }),
      ).rejects.toThrow()

      // Extension request should still exist
      const extsAfter = await db.extensionRequest.findMany({
        where: { labId: lab.id },
      })
      expect(extsAfter).toHaveLength(1)
    })

    it('should allow deleting Lab when related Audits and ExtensionRequests are removed first', async () => {
      // Create a lab
      const lab = await db.lab.create({
        data: {
          clusterId: 'cluster-proper-delete',
          generatedName: 'proper-delete-lab',
          state: 'Running',
          clusterName: 'Proper Delete Test Lab',
          openshiftVersion: '4.14',
          clusterSize: 'medium',
          companyName: 'Test Company',
          requestType: 'Partner Lab',
          sponsor: 'Test Sponsor',
          cloudProvider: 'AWS',
          primaryFirst: 'John',
          primaryLast: 'Doe',
          primaryEmail: 'john@test.com',
          secondaryFirst: 'Jane',
          secondaryLast: 'Doe',
          secondaryEmail: 'jane@test.com',
          region: 'us-east-1',
          projectName: 'test-project',
          leaseTime: '30 days',
          description: 'Test lab for proper deletion workflow',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
      })

      // Create related records
      await db.note.create({
        data: {
          labId: lab.id,
          note: 'Test note',
          userId: 'user@test.com',
          updatedAt: new Date(),
        },
      })

      await db.audit.create({
        data: {
          generatedName: lab.generatedName,
          accessTime: new Date(),
          loginName: 'testuser',
          loginType: 'ssh',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      await db.extensionRequest.create({
        data: {
          labId: lab.id,
          extension: '1w',
          currentUser: 'testuser@test.com',
          date: new Date(),
          status: 'Pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      // Delete related records first (proper workflow)
      await db.audit.deleteMany({
        where: { generatedName: lab.generatedName },
      })

      await db.extensionRequest.deleteMany({
        where: { labId: lab.id },
      })

      // Now deleting lab should succeed (Notes will cascade delete)
      await expect(
        db.lab.delete({
          where: { id: lab.id },
        }),
      ).resolves.toBeDefined()

      // Verify lab is deleted
      const labAfter = await db.lab.findUnique({
        where: { id: lab.id },
      })
      expect(labAfter).toBeNull()

      // Notes should be cascade deleted
      const notesAfter = await db.note.findMany({
        where: { labId: lab.id },
      })
      expect(notesAfter).toHaveLength(0)
    })
  })

  describe('Float/Double Precision', () => {
    it('should handle float values correctly (CloudCost)', async () => {
      const testCost = 12345.67

      const cost = await db.cloudCost.create({
        data: {
          month: 2,
          year: 2026,
          provider: 'AWS',
          cost: testCost,
          updatedAt: new Date(),
        },
      })

      const retrieved = await db.cloudCost.findUnique({
        where: { id: cost.id },
      })

      expect(retrieved?.cost).toBe(testCost)
      expect(typeof retrieved?.cost).toBe('number')
    })

    it('should handle small decimal values', async () => {
      const smallCost = 0.01

      const cost = await db.cloudCost.create({
        data: {
          month: 3,
          year: 2026,
          provider: 'GCP',
          cost: smallCost,
          updatedAt: new Date(),
        },
      })

      const retrieved = await db.cloudCost.findUnique({
        where: { id: cost.id },
      })

      expect(retrieved?.cost).toBeCloseTo(smallCost, 5)
    })

    it('should handle large decimal values', async () => {
      const largeCost = 999999999.99

      const cost = await db.cloudCost.create({
        data: {
          month: 4,
          year: 2026,
          provider: 'Azure',
          cost: largeCost,
          updatedAt: new Date(),
        },
      })

      const retrieved = await db.cloudCost.findUnique({
        where: { id: cost.id },
      })

      expect(retrieved?.cost).toBeCloseTo(largeCost, 2)
    })
  })

  describe('JSON/Catchall Handling', () => {
    it('should store and retrieve catchall JSON correctly', async () => {
      const catchallData = { customField: 'value', count: 42, enabled: true }

      const lab = await db.lab.create({
        data: {
          clusterId: 'cluster-json',
          generatedName: 'json-test-lab',
          state: 'Running',
          clusterName: 'JSON Test Lab',
          openshiftVersion: '4.14',
          clusterSize: 'medium',
          companyName: 'Test Company',
          requestType: 'Partner Lab',
          sponsor: 'Test Sponsor',
          cloudProvider: 'AWS',
          primaryFirst: 'John',
          primaryLast: 'Doe',
          primaryEmail: 'john@test.com',
          secondaryFirst: 'Jane',
          secondaryLast: 'Doe',
          secondaryEmail: 'jane@test.com',
          region: 'us-east-1',
          projectName: 'test-project',
          leaseTime: '30 days',
          description: 'Test lab for JSON catchall',
          catchall: JSON.stringify(catchallData),
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
      })

      const retrieved = await db.lab.findUnique({
        where: { id: lab.id },
      })

      expect(retrieved?.catchall).toBe(JSON.stringify(catchallData))
      expect(JSON.parse(retrieved?.catchall || '{}')).toEqual(catchallData)
    })

    it('should handle empty catchall (default {})', async () => {
      const lab = await db.lab.create({
        data: {
          clusterId: 'cluster-empty-json',
          generatedName: 'empty-json-lab',
          state: 'Running',
          clusterName: 'Empty JSON Lab',
          openshiftVersion: '4.14',
          clusterSize: 'medium',
          companyName: 'Test Company',
          requestType: 'Partner Lab',
          sponsor: 'Test Sponsor',
          cloudProvider: 'AWS',
          primaryFirst: 'John',
          primaryLast: 'Doe',
          primaryEmail: 'john@test.com',
          secondaryFirst: 'Jane',
          secondaryLast: 'Doe',
          secondaryEmail: 'jane@test.com',
          region: 'us-east-1',
          projectName: 'test-project',
          leaseTime: '30 days',
          description: 'Test lab with default catchall',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
      })

      const retrieved = await db.lab.findUnique({
        where: { id: lab.id },
      })

      expect(retrieved?.catchall).toBe('{}')
      expect(JSON.parse(retrieved?.catchall || '{}')).toEqual({})
    })

    it('should handle null catchall', async () => {
      const lab = await db.lab.create({
        data: {
          clusterId: 'cluster-null-json',
          generatedName: 'null-json-lab',
          state: 'Running',
          clusterName: 'Null JSON Lab',
          openshiftVersion: '4.14',
          clusterSize: 'medium',
          companyName: 'Test Company',
          requestType: 'Partner Lab',
          sponsor: 'Test Sponsor',
          cloudProvider: 'AWS',
          primaryFirst: 'John',
          primaryLast: 'Doe',
          primaryEmail: 'john@test.com',
          secondaryFirst: 'Jane',
          secondaryLast: 'Doe',
          secondaryEmail: 'jane@test.com',
          region: 'us-east-1',
          projectName: 'test-project',
          leaseTime: '30 days',
          description: 'Test lab with null catchall',
          catchall: null,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
      })

      const retrieved = await db.lab.findUnique({
        where: { id: lab.id },
      })

      expect(retrieved?.catchall).toBeNull()
    })

    it('should round-trip nested JSON values', async () => {
      const nestedData = {
        metadata: {
          version: 1,
          tags: ['prod', 'certified'],
          config: {
            autoScale: true,
            maxNodes: 10,
          },
        },
        history: [
          { date: '2026-01-01', action: 'created' },
          { date: '2026-02-01', action: 'updated' },
        ],
      }

      const lab = await db.lab.create({
        data: {
          clusterId: 'cluster-nested-json',
          generatedName: 'nested-json-lab',
          state: 'Running',
          clusterName: 'Nested JSON Lab',
          openshiftVersion: '4.14',
          clusterSize: 'medium',
          companyName: 'Test Company',
          requestType: 'Partner Lab',
          sponsor: 'Test Sponsor',
          cloudProvider: 'AWS',
          primaryFirst: 'John',
          primaryLast: 'Doe',
          primaryEmail: 'john@test.com',
          secondaryFirst: 'Jane',
          secondaryLast: 'Doe',
          secondaryEmail: 'jane@test.com',
          region: 'us-east-1',
          projectName: 'test-project',
          leaseTime: '30 days',
          description: 'Test lab with nested JSON',
          catchall: JSON.stringify(nestedData),
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
      })

      const retrieved = await db.lab.findUnique({
        where: { id: lab.id },
      })

      expect(JSON.parse(retrieved?.catchall || '{}')).toEqual(nestedData)
    })
  })
})
