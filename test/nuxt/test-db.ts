import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../../server/db/schema'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'

export type TestDb = LibSQLDatabase<typeof schema>

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    password_hash TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'user',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
  )`,
  `CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    prefix TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    limit_per_day INTEGER NOT NULL DEFAULT 10000,
    last_used_at INTEGER,
    revoked_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  `CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id)`,
  `CREATE TABLE IF NOT EXISTS usage_daily (
    id TEXT PRIMARY KEY,
    api_key_id TEXT NOT NULL,
    day TEXT NOT NULL,
    requests INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id)
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS usage_daily_key_day_uniq ON usage_daily(api_key_id, day)`,
  `CREATE INDEX IF NOT EXISTS usage_daily_key_idx ON usage_daily(api_key_id)`,
  `CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    is_secret INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
    updated_by TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS app_config_updated_at_idx ON app_config(updated_at)`,
]

export async function createTestDb(): Promise<TestDb> {
  const client = createClient({ url: ':memory:' })
  const db = drizzle(client, { schema })

  for (const sql of MIGRATIONS) {
    await client.execute(sql)
  }

  return db
}

export async function seedTestDb(db: TestDb) {
  const user = {
    id: 'user-1',
    email: 'test@test.com',
    name: 'Test User',
    passwordHash: '',
    role: 'user' as const,
  }

  const admin = {
    id: 'admin-1',
    email: 'admin@test.com',
    name: 'Admin',
    passwordHash: '',
    role: 'admin' as const,
  }

  await db.insert(schema.users).values([user, admin])

  return { user, admin }
}
