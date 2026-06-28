import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash').notNull().default(''),
  role: text('role').notNull().default('user'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(strftime('%s','now') * 1000)`),
})

export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  name: text('name').notNull(),
  prefix: text('prefix').notNull(),
  keyHash: text('key_hash').notNull().unique(),
  limitPerDay: integer('limit_per_day').notNull().default(10000),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp_ms' }),
  revokedAt: integer('revoked_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(strftime('%s','now') * 1000)`),
}, (table) => ({
  userIndex: index('api_keys_user_id_idx').on(table.userId),
}))

export const usageDaily = sqliteTable('usage_daily', {
  id: text('id').primaryKey(),
  apiKeyId: text('api_key_id')
    .notNull()
    .references(() => apiKeys.id),
  day: text('day').notNull(),
  requests: integer('requests').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(strftime('%s','now') * 1000)`),
}, (table) => ({
  keyDayUnique: uniqueIndex('usage_daily_key_day_uniq').on(table.apiKeyId, table.day),
  keyIndex: index('usage_daily_key_idx').on(table.apiKeyId),
}))

export const appConfig = sqliteTable('app_config', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  isSecret: integer('is_secret', { mode: 'boolean' }).notNull().default(false),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(strftime('%s','now') * 1000)`),
  updatedBy: text('updated_by'),
}, (table) => ({
  updatedAtIndex: index('app_config_updated_at_idx').on(table.updatedAt),
}))
