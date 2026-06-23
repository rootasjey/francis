import { createError, getQuery } from 'h3'
import { eq, desc } from 'drizzle-orm'
import type { UsageResponse } from '../../../shared/types/api'
import { apiKeys, usageDaily } from '../../db/schema'
import { getDb } from '../../db/client'
import * as sessionUtils from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await sessionUtils.requireSessionUser(event)

  const query = getQuery(event)
  const apiKeyId = String(query.apiKeyId || '')

  if (!apiKeyId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing apiKeyId',
    })
  }

  const db = getDb(event)
  const isAdmin = session.user.role === 'admin'

  if (!isAdmin) {
    const [key] = await db
      .select({ id: apiKeys.id, userId: apiKeys.userId })
      .from(apiKeys)
      .where(eq(apiKeys.id, apiKeyId))

    if (!key || key.userId !== session.user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
      })
    }
  }

  const rows = await db
    .select({
      day: usageDaily.day,
      requests: usageDaily.requests,
    })
    .from(usageDaily)
    .where(eq(usageDaily.apiKeyId, apiKeyId))
    .orderBy(desc(usageDaily.day))
    .limit(60)

  const response: UsageResponse = {
    apiKeyId,
    items: rows.reverse(),
  }

  return response
})
