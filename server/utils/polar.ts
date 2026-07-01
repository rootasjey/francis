import { Polar } from '@polar-sh/sdk'
import type { H3Event } from 'h3'
import { createError } from 'h3'
import { eq } from 'drizzle-orm'
import { getDb } from '../db/client'
import { users } from '../db/schema'

export function getPolarClient(event: H3Event): Polar {
  const config = useRuntimeConfig()

  if (!config.polarAccessToken) {
    throw createError({ statusCode: 500, statusMessage: 'Polar not configured' })
  }

  return new Polar({
    accessToken: config.polarAccessToken,
    server: config.polarServer as 'sandbox' | 'production',
  })
}

type PolarUser = { id: string; email: string; name?: string | null }

export async function getOrCreatePolarCustomer(event: H3Event, user: PolarUser) {
  const polar = getPolarClient(event)

  try {
    const existing = await polar.customers.getByExternalId({ externalId: user.id })
    return existing
  } catch {
    return await polar.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      externalId: user.id,
    })
  }
}

export async function syncPolarCustomerId(event: H3Event, userId: string, polarCustomerId: string) {
  const db = getDb(event)
  await db
    .update(users)
    .set({ polarCustomerId })
    .where(eq(users.id, userId))
}
