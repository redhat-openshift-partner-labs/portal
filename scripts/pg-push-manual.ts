#!/usr/bin/env tsx
/**
 * Manual PostgreSQL Schema Push Script
 *
 * This script generates SQL from the Prisma schema and outputs it to stdout
 * or a file. Use this when `prisma db push` fails due to connection issues
 * with the Prisma schema-engine binary.
 *
 * Usage:
 *   pnpm db:pg:push:sql                    # Output SQL to stdout
 *   pnpm db:pg:push:sql > schema.sql       # Save to file
 *   pnpm db:pg:push:sql | psql "postgres://..."  # Pipe directly to psql
 *
 * For initial setup (empty database):
 *   Uses --from-empty to generate full schema creation SQL
 *
 * For incremental changes (existing database):
 *   Set DATABASE_URL and the script will diff against current schema
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'

const SCHEMA_PATH = 'prisma/schema.postgresql.prisma'

function main(): void {
  const schemaPath = resolve(process.cwd(), SCHEMA_PATH)

  if (!existsSync(schemaPath)) {
    console.error(`Error: Schema file not found at ${SCHEMA_PATH}`)
    process.exit(1)
  }

  const databaseUrl = process.env.DATABASE_URL

  // Determine if we're doing initial setup or incremental diff
  const isIncremental = databaseUrl && process.argv.includes('--incremental')

  let command: string

  if (isIncremental) {
    // Diff against existing database
    command = `npx prisma migrate diff --from-url "${databaseUrl}" --to-schema-datamodel ${SCHEMA_PATH} --script`
    console.error('Generating incremental migration SQL (comparing against existing database)...')
  } else {
    // Generate full schema from empty
    command = `npx prisma migrate diff --from-empty --to-schema-datamodel ${SCHEMA_PATH} --script`
    console.error('Generating full schema SQL (from empty database)...')
  }

  try {
    const sql = execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    // Output SQL to stdout
    console.log(sql)

    console.error('\n-- SQL generated successfully.')
    console.error('-- Apply with: psql "$DATABASE_URL" -f <file.sql>')
    console.error('-- Or pipe:    pnpm db:pg:push:sql | psql "$DATABASE_URL"')
  } catch (error: unknown) {
    const execError = error as { stderr?: Buffer | string; message?: string }
    console.error('Error generating SQL:')
    console.error(execError.stderr?.toString() || execError.message)
    process.exit(1)
  }
}

main()
