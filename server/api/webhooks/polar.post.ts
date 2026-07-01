import { eq } from 'drizzle-orm'
import { getDb } from '../../db/client'
import { users } from '../../db/schema'
import { getPolarClient } from '../../utils/polar'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  return Webhooks({
    webhookSecret: config.polarWebhookSecret,
    onSubscriptionCreated: async (payload) => {
      const sub = payload.data
      const db = getDb(event)
      await db
        .update(users)
        .set({
          polarSubscriptionId: sub.id,
          polarSubscriptionStatus: sub.status,
          polarProductTier: sub.product?.name?.toLowerCase() ?? null,
          subscriptionEndsAt: sub.currentPeriodEnd
            ? new Date(sub.currentPeriodEnd).getTime()
            : null,
        })
        .where(eq(users.polarCustomerId, sub.customer?.id))
    },
    onSubscriptionActive: async (payload) => {
      const sub = payload.data
      const db = getDb(event)
      await db
        .update(users)
        .set({
          polarSubscriptionStatus: sub.status,
          subscriptionEndsAt: sub.currentPeriodEnd
            ? new Date(sub.currentPeriodEnd).getTime()
            : null,
        })
        .where(eq(users.polarSubscriptionId, sub.id))
    },
    onSubscriptionUpdated: async (payload) => {
      const sub = payload.data
      const db = getDb(event)
      await db
        .update(users)
        .set({
          polarSubscriptionStatus: sub.status,
          polarProductTier: sub.product?.name?.toLowerCase() ?? null,
          subscriptionEndsAt: sub.currentPeriodEnd
            ? new Date(sub.currentPeriodEnd).getTime()
            : null,
        })
        .where(eq(users.polarSubscriptionId, sub.id))
    },
    onSubscriptionCanceled: async (payload) => {
      const sub = payload.data
      const db = getDb(event)
      await db
        .update(users)
        .set({ polarSubscriptionStatus: 'canceled' })
        .where(eq(users.polarSubscriptionId, sub.id))
    },
    onSubscriptionRevoked: async (payload) => {
      const sub = payload.data
      const db = getDb(event)
      await db
        .update(users)
        .set({
          polarSubscriptionId: null,
          polarSubscriptionStatus: null,
          polarProductTier: null,
          subscriptionEndsAt: null,
        })
        .where(eq(users.polarSubscriptionId, sub.id))
    },
    onCustomerStateChanged: async (payload) => {
      const customerId = payload.data?.customer?.id
      const externalId = payload.data?.customer?.externalId
      if (!customerId || !externalId) return

      const polar = getPolarClient(event)
      const state = await polar.customers.getStateByExternalId({ externalId })

      const activeSub = state.activeSubscriptions?.[0]
      const db = getDb(event)
      await db
        .update(users)
        .set({
          polarCustomerId: customerId,
          polarSubscriptionId: activeSub?.id ?? null,
          polarSubscriptionStatus: activeSub?.status ?? null,
          polarProductTier: activeSub?.product?.name?.toLowerCase() ?? null,
          subscriptionEndsAt: activeSub?.currentPeriodEnd
            ? new Date(activeSub.currentPeriodEnd).getTime()
            : null,
        })
        .where(eq(users.id, externalId))
    },
  })(event)
})
