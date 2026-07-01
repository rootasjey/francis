import { createError } from 'h3'
import { eq } from 'drizzle-orm'
import { getDb } from '../../db/client'
import { users } from '../../db/schema'
import { requireSessionUser } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireSessionUser(event)
  const config = useRuntimeConfig()

  const db = getDb(event)
  const [user] = await db
    .select({ polarCustomerId: users.polarCustomerId })
    .from(users)
    .where(eq(users.id, session.user.id))

  if (!user?.polarCustomerId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No Polar subscription found. Subscribe at /api/polar/checkout',
    })
  }

  return CustomerPortal({
    accessToken: config.polarAccessToken,
    server: config.polarServer as 'sandbox' | 'production',
    returnUrl: config.polarCheckoutSuccessUrl,
    getCustomerId: () => Promise.resolve(user.polarCustomerId!),
  })(event)
})
