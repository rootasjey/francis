import { desc, eq } from 'drizzle-orm'
import type { ApiKeyListResponse } from '../../../shared/types/api'
import { apiKeys } from '../../db/schema'
import { getDb } from '../../db/client'
import * as sessionUtils from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await sessionUtils.requireSessionUser(event)
  const isAdmin = session.user.role === 'admin'

  const db = getDb(event)
  const query = db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      prefix: apiKeys.prefix,
      limitPerDay: apiKeys.limitPerDay,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys)
    .orderBy(desc(apiKeys.createdAt))

  const rows = isAdmin
    ? await query
    : await query.where(eq(apiKeys.userId, session.user.id))

  const items = rows.map((row) => ({
    ...row,
    createdAt: row.createdAt instanceof Date ? row.createdAt.getTime() : row.createdAt,
    lastUsedAt: row.lastUsedAt instanceof Date ? row.lastUsedAt.getTime() : row.lastUsedAt,
    revokedAt: row.revokedAt instanceof Date ? row.revokedAt.getTime() : row.revokedAt,
  }))

  const response: ApiKeyListResponse = { items }
  return response
})
