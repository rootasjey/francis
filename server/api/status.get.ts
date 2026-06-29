import { sql } from 'drizzle-orm'
import { getDb } from '../db/client'

export default defineEventHandler(async (event) => {
  const checks: Record<string, {
    status: 'ok' | 'degraded' | 'down'
    latency?: number
    message?: string
  }> = {}

  // API
  checks.api = { status: 'ok', latency: 0 }

  // D1 Database
  const dbStart = Date.now()
  try {
    const db = getDb(event)
    await db.run(sql`SELECT 1`)
    checks.database = { status: 'ok', latency: Date.now() - dbStart }
  } catch (err) {
    checks.database = {
      status: 'down',
      latency: Date.now() - dbStart,
      message: err instanceof Error ? err.message : 'Database unreachable',
    }
  }

  // KV
  const kvStart = Date.now()
  try {
    const env = event.context.cloudflare?.env as { KV?: { get: Function } } | undefined
    if (env?.KV) {
      checks.kv = { status: 'ok', latency: Date.now() - kvStart }
    } else {
      checks.kv = { status: 'degraded', message: 'KV binding not available' }
    }
  } catch (err) {
    checks.kv = {
      status: 'down',
      latency: Date.now() - kvStart,
      message: err instanceof Error ? err.message : 'KV unreachable',
    }
  }

  // OpenRouter
  try {
    const cfg = await getConfigMap(event)
    const hasKey = (cfg.openrouter_api_key?.value ?? '').length > 0
    checks.openrouter = {
      status: hasKey ? 'ok' : 'degraded',
      message: hasKey ? 'API key configured' : 'No API key set — translations disabled',
    }
  } catch {
    checks.openrouter = { status: 'degraded', message: 'Could not verify configuration' }
  }

  const values = Object.values(checks)
  const overall =
    values.every(c => c.status === 'ok') ? 'ok'
    : values.some(c => c.status === 'down') ? 'down'
    : 'degraded'

  return {
    ok: overall === 'ok',
    status: overall,
    service: 'francis',
    version: useRuntimeConfig().public.appVersion,
    timestamp: Date.now(),
    checks,
  }
})
