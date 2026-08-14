import { createError, getQuery } from 'h3'
import { eq } from 'drizzle-orm'
import { emailVerificationTokens, users } from '../../db/schema'
import { getDb } from '../../db/client'
import { hashToken } from '../../utils/tokens'

export default defineEventHandler(async (event) => {
  const token = String(getQuery(event).token || '')
  if (!token) throw createError({ statusCode: 400, statusMessage: 'Missing verification token' })

  const db = getDb(event)
  const [record] = await db
    .select()
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.tokenHash, await hashToken(token)))

  if (!record || new Date(record.expiresAt).getTime() <= Date.now()) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired verification token' })
  }

  await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, record.userId))
  await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, record.id))
  return { verified: true }
})
