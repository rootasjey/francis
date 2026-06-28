import { setConfig, CONFIG_KEYS } from '~~/server/utils/config'
import { getUserSession } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const session = await getUserSession(event)
  const body = await readBody<{ key: string, value: string }>(event)

  if (!body?.key || typeof body.value !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing key or value' })
  }

  const validKeys = Object.values(CONFIG_KEYS) as string[]
  if (!validKeys.includes(body.key)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid config key: ${body.key}` })
  }

  if (body.key === CONFIG_KEYS.openrouterFallbackModels) {
    try {
      const parsed = JSON.parse(body.value)
      if (!Array.isArray(parsed) || !parsed.every(v => typeof v === 'string')) {
        throw new Error('not a string array')
      }
    } catch {
      throw createError({ statusCode: 400, statusMessage: 'Fallback models must be a JSON array of strings' })
    }
  }

  const email = session?.user?.email ?? 'unknown'
  await setConfig(event, body.key as any, body.value, email)
  return { ok: true, key: body.key }
})
