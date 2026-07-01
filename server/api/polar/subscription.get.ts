import { eq } from 'drizzle-orm'
import { getDb } from '../../db/client'
import { users } from '../../db/schema'
import { requireSessionUser } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireSessionUser(event)

  const db = getDb(event)
  const [user] = await db
    .select({
      polarCustomerId: users.polarCustomerId,
      polarSubscriptionStatus: users.polarSubscriptionStatus,
      polarProductTier: users.polarProductTier,
      subscriptionEndsAt: users.subscriptionEndsAt,
    })
    .from(users)
    .where(eq(users.id, session.user.id))

  if (!user) {
    return { tier: null, status: null, endsAt: null, customerId: null }
  }

  return {
    tier: user.polarProductTier,
    status: user.polarSubscriptionStatus,
    endsAt: user.subscriptionEndsAt?.getTime() ?? null,
    customerId: user.polarCustomerId,
  }
})
