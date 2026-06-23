import { defineNitroPlugin } from 'nitropack/runtime/plugin'
import { eq } from 'drizzle-orm'
import { hashPassword } from '../utils/password'

export default defineNitroPlugin(async () => {
  if (import.meta.dev) {
    return
  }

  const adminEmail = process.env.NUXT_ADMIN_EMAIL
  const adminPassword = process.env.NUXT_ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    return
  }

  try {
    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.role, 'admin'))
      .limit(1)

    if (existing.length > 0) {
      return
    }

    const passwordHash = await hashPassword(adminPassword)

    await db.insert(schema.users).values({
      id: crypto.randomUUID(),
      email: adminEmail,
      name: 'Admin',
      role: 'admin',
      passwordHash,
      createdAt: new Date(),
    })
  } catch {
    // DB might not have schema ready yet (cold start race); admin can be created via UI
  }
})
