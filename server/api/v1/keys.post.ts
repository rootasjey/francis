import { createError, readBody } from 'h3'
import type { CreateKeyRequest, CreateKeyResponse } from '../../../shared/types/api'
import { apiKeys } from '../../db/schema'
import { getDb } from '../../db/client'
import { generateApiKey, hashKey, keyPrefix } from '../../utils/api-key'
import * as sessionUtils from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await sessionUtils.requireSessionUser(event)

  const body = await readBody<CreateKeyRequest>(event)
  const runtimeConfig = useRuntimeConfig()

  if (!body?.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing key name',
    })
  }

  const rawKey = generateApiKey()
  const now = new Date()
  const createdAtMs = now.getTime()
  const limitPerDay = body.limitPerDay ?? runtimeConfig.apiDefaultLimit
  const isAdmin = session.user.role === 'admin'
  const userId = isAdmin ? (body.userId ?? session.user.id) : session.user.id

  const record = {
    id: crypto.randomUUID(),
    userId,
    name: body.name,
    prefix: keyPrefix(rawKey),
    keyHash: await hashKey(rawKey),
    limitPerDay,
    createdAt: now,
    lastUsedAt: null,
    revokedAt: null,
  }

  const db = getDb(event)
  await db.insert(apiKeys).values(record)

  const response: CreateKeyResponse = {
    key: rawKey,
    record: {
      id: record.id,
      name: record.name,
      prefix: record.prefix,
      limitPerDay: record.limitPerDay,
      createdAt: createdAtMs,
      lastUsedAt: record.lastUsedAt,
      revokedAt: record.revokedAt,
    },
  }

  return response
})
