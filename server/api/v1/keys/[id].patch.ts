import { createError, getRouterParam, readBody } from 'h3'
import { eq } from 'drizzle-orm'
import type { UpdateKeyRequest } from '../../../../shared/types/api'
import { apiKeys } from '../../../db/schema'
import { getDb } from '../../../db/client'
import * as sessionUtils from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await sessionUtils.requireSessionUser(event)
  const runtimeConfig = useRuntimeConfig()

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing key id' })
  }

  const body = await readBody<UpdateKeyRequest>(event)

  if (!body || (body.name === undefined && body.limitPerDay === undefined)) {
    throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
  }

  if (body.name !== undefined && !body.name.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Key name cannot be empty' })
  }

  if (body.limitPerDay !== undefined) {
    if (body.limitPerDay < 0) {
      throw createError({ statusCode: 400, statusMessage: 'Daily limit must be >= 0' })
    }
    if (body.limitPerDay > runtimeConfig.apiMaxLimit) {
      throw createError({ statusCode: 400, statusMessage: `Daily limit cannot exceed ${runtimeConfig.apiMaxLimit}` })
    }
  }

  const db = getDb(event)
  const [key] = await db
    .select({ id: apiKeys.id, userId: apiKeys.userId })
    .from(apiKeys)
    .where(eq(apiKeys.id, id))

  if (!key) {
    throw createError({ statusCode: 404, statusMessage: 'Key not found' })
  }

  const isAdmin = session.user.role === 'admin'
  if (!isAdmin && key.userId !== session.user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const updates: Record<string, string | number> = {}
  if (body.name !== undefined) updates.name = body.name.trim()
  if (body.limitPerDay !== undefined) updates.limitPerDay = body.limitPerDay

  await db.update(apiKeys).set(updates).where(eq(apiKeys.id, id))

  const [updated] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.id, id))

  return {
    id: updated.id,
    name: updated.name,
    prefix: updated.prefix,
    limitPerDay: updated.limitPerDay,
    createdAt: updated.createdAt.getTime(),
    lastUsedAt: updated.lastUsedAt?.getTime() ?? null,
    revokedAt: updated.revokedAt?.getTime() ?? null,
  }
})
