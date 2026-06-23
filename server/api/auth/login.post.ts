import { createError, readBody } from 'h3'
import { eq } from 'drizzle-orm'
import { users } from '../../db/schema'
import { getDb } from '../../db/client'
import { verifyPassword as verifyPasswordLocal } from '../../utils/password'
import { setUserSession as setUserSessionLocal } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string }>(event)

  const email = body?.email?.trim().toLowerCase() || ''
  const password = body?.password || ''

  if (!email || !email.includes('@') || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid credentials' })
  }

  const db = getDb(event)
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))

  if (!user || !user.passwordHash) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const valid = await verifyPasswordLocal(user.passwordHash, password)

  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  await setUserSessionLocal(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'user' | 'admin',
    },
    loggedInAt: Date.now(),
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  }
})
