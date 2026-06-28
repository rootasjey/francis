import type { H3Event } from 'h3'
import { eq } from 'drizzle-orm'
import { getDb } from '../db/client'
import { appConfig } from '../db/schema'

export const CONFIG_KEYS = {
  openrouterApiKey: 'openrouter_api_key',
  openrouterModel: 'openrouter_model',
  openrouterFallbackModels: 'openrouter_fallback_models',
} as const

type ConfigKey = typeof CONFIG_KEYS[keyof typeof CONFIG_KEYS]

const ENV_FALLBACK: Record<ConfigKey, () => string> = {
  openrouter_api_key: () => useRuntimeConfig().openrouterApiKey ?? '',
  openrouter_model: () => useRuntimeConfig().openrouterModel ?? 'google/gemini-3.1-flash-lite',
  openrouter_fallback_models: () => JSON.stringify([
    'google/gemini-2.0-flash-001',
    'openai/gpt-4o-mini',
    'anthropic/claude-3.5-haiku',
  ]),
}

export async function getConfig(event: H3Event, key: ConfigKey): Promise<string> {
  try {
    const db = getDb(event)
    const rows = await db.select().from(appConfig).where(eq(appConfig.key, key)).limit(1)
    if (rows[0]) return rows[0].value
  } catch (err) {
    console.warn(`Failed to read config ${key} from D1:`, err)
  }
  return ENV_FALLBACK[key]()
}

export async function getConfigMap(event: H3Event): Promise<Record<string, { value: string, isSecret: boolean, updatedAt: number | null, updatedBy: string | null }>> {
  try {
    const db = getDb(event)
    const rows = await db.select().from(appConfig)
    const result: Record<string, { value: string, isSecret: boolean, updatedAt: number | null, updatedBy: string | null }> = {}
    for (const k of Object.values(CONFIG_KEYS)) {
      const fallback = ENV_FALLBACK[k]()
      const row = rows.find(r => r.key === k)
      result[k] = row
        ? { value: row.value, isSecret: row.isSecret, updatedAt: row.updatedAt.getTime(), updatedBy: row.updatedBy }
        : { value: fallback, isSecret: k.includes('key') || k.includes('secret'), updatedAt: null, updatedBy: null }
    }
    return result
  } catch (err) {
    console.warn('Failed to read config map from D1:', err)
    const result: Record<string, { value: string, isSecret: boolean, updatedAt: number | null, updatedBy: string | null }> = {}
    for (const k of Object.values(CONFIG_KEYS)) {
      result[k] = { value: ENV_FALLBACK[k](), isSecret: k.includes('key') || k.includes('secret'), updatedAt: null, updatedBy: null }
    }
    return result
  }
}

export async function setConfig(
  event: H3Event,
  key: ConfigKey,
  value: string,
  updatedBy: string,
): Promise<void> {
  const db = getDb(event)
  const isSecret = key.includes('key') || key.includes('secret')
  const now = new Date()
  await db
    .insert(appConfig)
    .values({ key, value, isSecret, updatedAt: now, updatedBy })
    .onConflictDoUpdate({
      target: appConfig.key,
      set: { value, updatedAt: now, updatedBy },
    })
}

export async function getApiKeyAndModels(event: H3Event): Promise<{ apiKey: string, model: string, fallbackModels: string[] }> {
  const [apiKey, model, fallbackJson] = await Promise.all([
    getConfig(event, CONFIG_KEYS.openrouterApiKey),
    getConfig(event, CONFIG_KEYS.openrouterModel),
    getConfig(event, CONFIG_KEYS.openrouterFallbackModels),
  ])
  let fallbackModels: string[] = []
  try {
    fallbackModels = JSON.parse(fallbackJson)
  } catch {
    fallbackModels = []
  }
  return { apiKey, model, fallbackModels }
}
