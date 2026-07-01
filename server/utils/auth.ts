import { createError, getRequestHeader } from 'h3'
import type { H3Event } from 'h3'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { apiKeys, usageDaily } from '../db/schema'
import { getDb } from '../db/client'
import { hashKey, normalizeKey } from './api-key'
import { requireSessionUser } from './session'
import { getPolarClient } from './polar'

export async function requireAdmin(event: H3Event) {
  const session = await requireSessionUser(event)
  const role = session?.user?.role

  if (role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }
}

export async function requireApiKey(event: H3Event) {
  const header = getRequestHeader(event, 'x-api-key')
    || getRequestHeader(event, 'authorization')

  const rawKey = normalizeKey(header)

  if (!rawKey) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing API key',
    })
  }

  const db = getDb(event)
  const keyHash = await hashKey(rawKey)

  const [key] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)))

  if (!key) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid API key',
    })
  }

  // Si Polar est configuré, vérifier l'abonnement
  const config = useRuntimeConfig()
  if (config.polarAccessToken && key.userId) {
    try {
      const polar = getPolarClient(event)
      const state = await polar.customers.getStateByExternalId({
        externalId: key.userId,
      })

      const hasActiveSub = (state.activeSubscriptions?.length ?? 0) > 0
      const hasAccess = state.grantedBenefits?.some(
        (b: any) => b.type === 'feature_flag' && b.properties?.flag === 'api_access',
      )

      if (!hasActiveSub && !hasAccess) {
        throw createError({
          statusCode: 402,
          statusMessage: 'Subscription required. Subscribe at /polar/checkout',
        })
      }
    } catch (err: any) {
      // Propager les erreurs 402
      if (err?.statusCode === 402) throw err
      // Fallback silencieux si Polar est indisponible
      console.warn('[polar] Subscription check failed, falling back to local limits:', err?.message)
    }
  }

  return key
}

export async function incrementUsage(event: H3Event, apiKeyId: string, limitPerDay: number, weight = 1, userId?: string) {
  const db = getDb(event)
  const day = new Date().toISOString().slice(0, 10)

  const [usage] = await db
    .select()
    .from(usageDaily)
    .where(and(eq(usageDaily.apiKeyId, apiKeyId), eq(usageDaily.day, day)))

  if (limitPerDay > 0 && usage?.requests !== undefined && usage.requests >= limitPerDay) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Rate limit exceeded',
    })
  }

  await db
    .insert(usageDaily)
    .values({
      id: crypto.randomUUID(),
      apiKeyId,
      day,
      requests: weight,
    })
    .onConflictDoUpdate({
      target: [usageDaily.apiKeyId, usageDaily.day],
      set: {
        requests: sql`${usageDaily.requests} + ${weight}`,
      },
    })

  // Enqueue usage event for Polar ingestion (fire & forget)
  if (userId) {
    try {
      const env = event.context.cloudflare?.env as { POLAR_EVENTS_QUEUE?: { send: (msg: unknown) => Promise<void> } } | undefined
      if (env?.POLAR_EVENTS_QUEUE) {
        await env.POLAR_EVENTS_QUEUE.send({
          name: 'api_request',
          externalCustomerId: userId,
          metadata: {
            requests: weight,
            apiKeyId,
            endpoint: event.path,
          },
          timestamp: new Date().toISOString(),
        })
      }
    } catch {
      // Non-bloquant : ignorer les erreurs de queue
    }
  }

  return day
}
