/**
 * Test Setup Helper
 *
 * Provides utilities for setting up and tearing down the test database.
 * Uses a separate SQLite test database to avoid affecting development data.
 */

import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import { existsSync, unlinkSync } from 'fs'
import { join } from 'path'

const TEST_DB_PATH = join(process.cwd(), 'prisma', 'test.db')

let testClient: PrismaClient | null = null

/**
 * Creates and returns a PrismaClient configured for testing.
 * The test database is created fresh on first call.
 */
export async function getTestDb(): Promise<PrismaClient> {
  if (testClient) {
    return testClient
  }

  // Create fresh test database
  if (existsSync(TEST_DB_PATH)) {
    unlinkSync(TEST_DB_PATH)
  }

  // Create database with schema
  const sqlite = new Database(TEST_DB_PATH)

  // Enable foreign keys
  sqlite.pragma('foreign_keys = ON')

  // Create tables matching Prisma schema
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS "companies" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "company_name" TEXT NOT NULL UNIQUE,
      "curated" INTEGER NOT NULL DEFAULT 0,
      "logo_url" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "labs" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "cluster_id" TEXT NOT NULL,
      "generated_name" TEXT NOT NULL UNIQUE,
      "state" TEXT NOT NULL,
      "cluster_name" TEXT NOT NULL,
      "openshift_version" TEXT NOT NULL,
      "cluster_size" TEXT NOT NULL,
      "company_name" TEXT NOT NULL,
      "company_id" INTEGER,
      "request_type" TEXT NOT NULL,
      "partner" INTEGER NOT NULL DEFAULT 0,
      "sponsor" TEXT NOT NULL,
      "cloud_provider" TEXT NOT NULL,
      "primary_first" TEXT NOT NULL,
      "primary_last" TEXT NOT NULL,
      "primary_email" TEXT NOT NULL,
      "secondary_first" TEXT NOT NULL,
      "secondary_last" TEXT NOT NULL,
      "secondary_email" TEXT NOT NULL,
      "region" TEXT NOT NULL,
      "always_on" INTEGER NOT NULL DEFAULT 0,
      "project_name" TEXT NOT NULL,
      "lease_time" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "notes" TEXT NOT NULL DEFAULT '',
      "start_date" DATETIME NOT NULL,
      "end_date" DATETIME NOT NULL,
      "completed_at" DATETIME,
      "hold" INTEGER NOT NULL DEFAULT 0,
      "extras" TEXT DEFAULT '{}',
      "request_id" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL,
      FOREIGN KEY ("company_id") REFERENCES "companies"("id")
    );

    CREATE TABLE IF NOT EXISTS "notes" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "lab_id" INTEGER NOT NULL,
      "user_id" TEXT,
      "note" TEXT NOT NULL,
      "immutable" INTEGER NOT NULL DEFAULT 0,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL,
      FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "audits" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "generated_name" TEXT,
      "access_time" DATETIME,
      "login_name" TEXT,
      "login_type" TEXT,
      "created_at" DATETIME,
      "updated_at" DATETIME,
      FOREIGN KEY ("generated_name") REFERENCES "labs"("generated_name")
    );

    CREATE TABLE IF NOT EXISTS "regexts" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "lab_id" INTEGER,
      "extension" TEXT,
      "current_user" TEXT,
      "date" DATETIME,
      "status" TEXT,
      "created_at" DATETIME,
      "updated_at" DATETIME,
      FOREIGN KEY ("lab_id") REFERENCES "labs"("id")
    );

    CREATE TABLE IF NOT EXISTS "users" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "user_id" TEXT,
      "first_name" TEXT,
      "last_name" TEXT,
      "full_name" TEXT,
      "email" TEXT NOT NULL UNIQUE,
      "picture" TEXT,
      "admin" INTEGER NOT NULL DEFAULT 0,
      "group" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "cloudcosts" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "month" INTEGER NOT NULL,
      "year" INTEGER NOT NULL,
      "provider" TEXT NOT NULL,
      "cost" REAL NOT NULL,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "openshift_version_mappings" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "name" TEXT UNIQUE,
      "location" TEXT,
      "rosa" INTEGER DEFAULT 0,
      "aro" INTEGER DEFAULT 0,
      "gro" INTEGER DEFAULT 0,
      "roks" INTEGER DEFAULT 0,
      "created_at" DATETIME,
      "updated_at" DATETIME
    );

    CREATE TABLE IF NOT EXISTS "denial_notes" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "lab_id" INTEGER NOT NULL UNIQUE,
      "user_id" TEXT NOT NULL,
      "reason" TEXT NOT NULL,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE
    );
  `)

  sqlite.close()

  // Create Prisma client
  const adapter = new PrismaBetterSqlite3({ url: `file:${TEST_DB_PATH}` })
  testClient = new PrismaClient({ adapter })

  return testClient
}

/**
 * Cleans all data from the test database while preserving the schema.
 */
export async function cleanTestDb(db: PrismaClient): Promise<void> {
  // Delete in order respecting foreign keys
  await db.$executeRawUnsafe('DELETE FROM denial_notes')
  await db.$executeRawUnsafe('DELETE FROM notes')
  await db.$executeRawUnsafe('DELETE FROM audits')
  await db.$executeRawUnsafe('DELETE FROM regexts')
  await db.$executeRawUnsafe('DELETE FROM labs')
  await db.$executeRawUnsafe('DELETE FROM companies')
  await db.$executeRawUnsafe('DELETE FROM users')
  await db.$executeRawUnsafe('DELETE FROM cloudcosts')
  await db.$executeRawUnsafe('DELETE FROM openshift_version_mappings')
}

/**
 * Closes the test database connection and removes the database file.
 */
export async function teardownTestDb(): Promise<void> {
  if (testClient) {
    await testClient.$disconnect()
    testClient = null
  }

  // Remove test database file
  if (existsSync(TEST_DB_PATH)) {
    unlinkSync(TEST_DB_PATH)
  }

  // Remove journal file if exists
  const journalPath = `${TEST_DB_PATH}-journal`
  if (existsSync(journalPath)) {
    unlinkSync(journalPath)
  }
}
