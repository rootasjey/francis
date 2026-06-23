import { drizzle } from 'drizzle-orm/d1'
import type { H3Event } from 'h3'
import { createError } from 'h3'
import * as schema from './schema'

export function getDb(event: H3Event) {
  const env = event.context.cloudflare?.env as { DB?: unknown } | undefined

  if (!env?.DB) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing D1 binding: DB',
    })
  }

  return drizzle(env.DB, { schema })
}
