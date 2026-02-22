import pg from 'pg'

let pool: pg.Pool | null = null

export function getDb(): pg.Pool {
  if (!pool) {
    const config = useRuntimeConfig()
    pool = new pg.Pool({
      host: config.db.host,
      port: parseInt(config.db.port),
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
    })
  }
  return pool
}

export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const db = getDb()
  const result = await db.query(sql, params)
  return result.rows as T[]
}
