import { createError, readBody } from 'h3'
import { eq } from 'drizzle-orm'
import { users } from '../../db/schema'
import { getDb } from '../../db/client'
import { hashPassword as hashPasswordLocal } from '../../utils/password'
import { setUserSession as setUserSessionLocal } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string; name?: string }>(event)

  const email = body?.email?.trim().toLowerCase() || ''
  const password = body?.password || ''
  const name = body?.name?.trim() || null

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email' })
  }

  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password too short' })
  }

  const db = getDb(event)

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))

  if (existing.length) {
    throw createError({ statusCode: 409, statusMessage: 'Email already registered' })
  }

  const [firstUser] = await db
    .select({ id: users.id })
    .from(users)
    .limit(1)

  const role: 'user' | 'admin' = firstUser ? 'user' : 'admin'
  const passwordHash = await hashPasswordLocal(password)

  const record = {
    id: crypto.randomUUID(),
    email,
    name,
    role,
    passwordHash,
    createdAt: new Date(),
  }

  await db.insert(users).values(record)

  await setUserSessionLocal(event, {
    user: {
      id: record.id,
      email: record.email,
      name: record.name,
      role: record.role,
    },
    loggedInAt: Date.now(),
  })

  return {
    user: {
      id: record.id,
      email: record.email,
      name: record.name,
      role: record.role,
    },
  }
})
