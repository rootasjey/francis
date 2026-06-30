import { createError, getRequestHeader } from 'h3'
import type { H3Event } from 'h3'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { apiKeys, usageDaily } from '../db/schema'
import { getDb } from '../db/client'
import { hashKey, normalizeKey } from './api-key'
import { requireSessionUser } from './session'

export async function requireAdmin(event: H3Event) {
  const session = await requireSessionUser(event)
  const role = session?.user?.role

  if (role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }
}

export async function requireApiKey(event: H3Event) {
  const header = getRequestHeader(event, 'x-api-key')
    || getRequestHeader(event, 'authorization')

  const rawKey = normalizeKey(header)

  if (!rawKey) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing API key',
    })
  }

  const db = getDb(event)
  const keyHash = await hashKey(rawKey)

  const [key] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)))

  if (!key) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid API key',
    })
  }

  return key
}

export async function incrementUsage(event: H3Event, apiKeyId: string, limitPerDay: number, weight = 1) {
  const db = getDb(event)
  const day = new Date().toISOString().slice(0, 10)

  const [usage] = await db
    .select()
    .from(usageDaily)
    .where(and(eq(usageDaily.apiKeyId, apiKeyId), eq(usageDaily.day, day)))

  if (limitPerDay > 0 && usage?.requests !== undefined && usage.requests >= limitPerDay) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Rate limit exceeded',
    })
  }

  await db
    .insert(usageDaily)
    .values({
      id: crypto.randomUUID(),
      apiKeyId,
      day,
      requests: weight,
    })
    .onConflictDoUpdate({
      target: [usageDaily.apiKeyId, usageDaily.day],
      set: {
        requests: sql`${usageDaily.requests} + ${weight}`,
      },
    })

  return day
}
