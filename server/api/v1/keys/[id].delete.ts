import { createError, getRouterParam } from 'h3'
import { eq } from 'drizzle-orm'
import { apiKeys } from '../../../db/schema'
import { getDb } from '../../../db/client'
import * as sessionUtils from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await sessionUtils.requireSessionUser(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing key id',
    })
  }

  const db = getDb(event)
  const [key] = await db
    .select({ id: apiKeys.id, userId: apiKeys.userId })
    .from(apiKeys)
    .where(eq(apiKeys.id, id))

  if (!key) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Key not found',
    })
  }

  const isAdmin = session.user.role === 'admin'

  if (!isAdmin && key.userId !== session.user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }

  await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(eq(apiKeys.id, id))

  return { ok: true }
})
