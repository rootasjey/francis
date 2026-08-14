import { createError, readBody } from 'h3'
import { eq } from 'drizzle-orm'
import { passwordResetTokens, users } from '../../db/schema'
import { getDb } from '../../db/client'
import { sendPasswordResetEmail } from '../../utils/email'
import { createToken, hashToken } from '../../utils/tokens'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string }>(event)
  const email = body?.email?.trim().toLowerCase() || ''

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email' })
  }

  const db = getDb(event)
  const [user] = await db.select().from(users).where(eq(users.email, email))

  // Keep this response identical whether or not the address exists.
  if (user) {
    const token = createToken()
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id))
    await db.insert(passwordResetTokens).values({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: await hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    })
    await sendPasswordResetEmail(event, user.email, token)
  }

  return { message: 'If an account exists for this email, a reset link has been sent.' }
})
