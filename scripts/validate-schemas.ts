/**
 * Schema Validation Script
 *
 * Validates that the SQLite and PostgreSQL Prisma schemas have identical
 * model definitions. This ensures that changes to one schema are reflected
 * in the other.
 *
 * Usage: pnpm db:validate
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SQLITE_SCHEMA = resolve(__dirname, '../prisma/schema.prisma')
const PG_SCHEMA = resolve(__dirname, '../prisma/schema.postgresql.prisma')

/**
 * Extracts model and enum definitions from a Prisma schema,
 * ignoring generator and datasource blocks.
 */
function extractModels(schemaContent: string): string {
  const lines = schemaContent.split('\n')
  const result: string[] = []
  let inBlock = false
  let blockType = ''
  let braceDepth = 0

  for (const line of lines) {
    const trimmed = line.trim()

    // Detect start of a block
    if (!inBlock) {
      if (trimmed.startsWith('generator ') || trimmed.startsWith('datasource ')) {
        inBlock = true
        blockType = 'skip'
        if (trimmed.includes('{')) {
          braceDepth = 1
        }
        continue
      }

      if (trimmed.startsWith('model ') || trimmed.startsWith('enum ')) {
        inBlock = true
        blockType = 'keep'
        braceDepth = trimmed.includes('{') ? 1 : 0
        result.push(line)
        continue
      }

      // Skip empty lines and comments at top level
      if (trimmed === '' || trimmed.startsWith('//')) {
        continue
      }

      result.push(line)
      continue
    }

    // Track brace depth
    for (const char of trimmed) {
      if (char === '{') braceDepth++
      if (char === '}') braceDepth--
    }

    // Add line if we're in a keep block
    if (blockType === 'keep') {
      result.push(line)
    }

    // Check if block ended
    if (braceDepth === 0) {
      inBlock = false
      blockType = ''
    }
  }

  return result.join('\n').trim()
}

/**
 * Normalizes whitespace for comparison
 */
function normalize(content: string): string {
  return content
    .split('\n')
    .map(line => line.trimEnd())
    .filter(line => line.trim() !== '')
    .join('\n')
}

function main(): void {
  console.log('Validating Prisma schemas...\n')

  let sqliteContent: string
  let pgContent: string

  try {
    sqliteContent = readFileSync(SQLITE_SCHEMA, 'utf-8')
  }
  catch {
    console.error(`Error: Could not read SQLite schema at ${SQLITE_SCHEMA}`)
    process.exit(1)
  }

  try {
    pgContent = readFileSync(PG_SCHEMA, 'utf-8')
  }
  catch {
    console.error(`Error: Could not read PostgreSQL schema at ${PG_SCHEMA}`)
    process.exit(1)
  }

  const sqliteModels = normalize(extractModels(sqliteContent))
  const pgModels = normalize(extractModels(pgContent))

  if (sqliteModels === pgModels) {
    console.log('✓ Schemas are in sync!')
    console.log('  - SQLite schema: prisma/schema.prisma')
    console.log('  - PostgreSQL schema: prisma/schema.postgresql.prisma')
    process.exit(0)
  }

  console.error('✗ Schema mismatch detected!')
  console.error('')
  console.error('The model definitions in the SQLite and PostgreSQL schemas differ.')
  console.error('Please ensure both schemas have identical model/enum definitions.')
  console.error('')
  console.error('Files:')
  console.error('  - SQLite: prisma/schema.prisma')
  console.error('  - PostgreSQL: prisma/schema.postgresql.prisma')
  console.error('')

  // Show line-by-line diff hints
  const sqliteLines = sqliteModels.split('\n')
  const pgLines = pgModels.split('\n')
  const maxLines = Math.max(sqliteLines.length, pgLines.length)

  let diffCount = 0
  for (let i = 0; i < maxLines && diffCount < 5; i++) {
    const sqliteLine = sqliteLines[i] || ''
    const pgLine = pgLines[i] || ''
    if (sqliteLine !== pgLine) {
      diffCount++
      console.error(`Difference at line ${i + 1}:`)
      console.error(`  SQLite: ${sqliteLine}`)
      console.error(`  PG:     ${pgLine}`)
      console.error('')
    }
  }

  if (diffCount === 5) {
    console.error('... (showing first 5 differences)')
  }

  process.exit(1)
}

main()
