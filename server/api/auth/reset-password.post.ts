import { createError, readBody } from 'h3'
import { eq } from 'drizzle-orm'
import { passwordResetTokens, users } from '../../db/schema'
import { getDb } from '../../db/client'
import { hashPassword } from '../../utils/password'
import { hashToken } from '../../utils/tokens'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ token?: string; password?: string }>(event)
  const token = body?.token || ''
  const password = body?.password || ''

  if (!token) throw createError({ statusCode: 400, statusMessage: 'Missing reset token' })
  if (password.length < 8) throw createError({ statusCode: 400, statusMessage: 'Password too short' })

  const db = getDb(event)
  const [record] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.tokenHash, await hashToken(token)))

  if (!record || new Date(record.expiresAt).getTime() <= Date.now()) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired reset token' })
  }

  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, record.userId))
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, record.id))
  return { reset: true }
})
