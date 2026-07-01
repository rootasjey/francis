import { describe, expect, it } from 'vitest'
import { createTestDb, seedTestDb } from '../nuxt/test-db'
import { eq } from 'drizzle-orm'
import * as schema from '../../server/db/schema'

describe('test-db', () => {
  it('should create tables and seed data', async () => {
    const db = await createTestDb()
    const { user, admin } = await seedTestDb(db)

    const users = await db.select().from(schema.users)
    expect(users).toHaveLength(2)
    expect(users[0].email).toBe('test@test.com')
    expect(users[1].email).toBe('admin@test.com')
  })

  it('should enforce unique email constraint', async () => {
    const db = await createTestDb()
    await seedTestDb(db)

    await expect(
      db.insert(schema.users).values({
        id: 'dup',
        email: 'test@test.com',
        passwordHash: '',
        role: 'user',
      }),
    ).rejects.toThrow()
  })

  it('should allow CRUD operations with drizzle queries', async () => {
    const db = await createTestDb()
    const { user } = await seedTestDb(db)

    const rows = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
    expect(rows).toHaveLength(1)
    expect(rows[0].email).toBe('test@test.com')

    const key = await db.insert(schema.apiKeys).values({
      id: 'key-1',
      userId: user.id,
      name: 'Test Key',
      prefix: 'fcs_tst',
      keyHash: 'abc123hash',
      limitPerDay: 1000,
    }).returning()

    expect(key[0].name).toBe('Test Key')

    const daily = await db.insert(schema.usageDaily).values({
      id: 'usage-1',
      apiKeyId: 'key-1',
      day: '2025-06-15',
      requests: 5,
    }).returning()

    expect(daily[0].requests).toBe(5)

    await db.insert(schema.appConfig).values({
      key: 'test_key',
      value: 'test_value',
      isSecret: false,
      updatedBy: user.id,
    }).onConflictDoUpdate({
      target: schema.appConfig.key,
      set: { value: 'updated_value' },
    })

    const config = await db
      .select()
      .from(schema.appConfig)
      .where(eq(schema.appConfig.key, 'test_key'))

    expect(config[0].value).toBe('test_value')
  })

  it('should be isolated between calls', async () => {
    const db1 = await createTestDb()
    const db2 = await createTestDb()

    await seedTestDb(db1)

    const users1 = await db1.select().from(schema.users)
    const users2 = await db2.select().from(schema.users)
    expect(users1).toHaveLength(2)
    expect(users2).toHaveLength(0)
  })
})
