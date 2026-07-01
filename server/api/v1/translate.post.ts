import { createError, readBody } from 'h3'
import type { TranslateRequest, TranslateResponse } from '../../../shared/types/api'
import { apiKeys } from '../../db/schema'
import { getDb } from '../../db/client'
import { incrementUsage, requireApiKey } from '../../utils/auth'
import { eq } from 'drizzle-orm'
import { translateTexts, validateTargetLanguages } from '../../utils/translate'
import { getApiKeyAndModels } from '../../utils/config'

const MAX_TEXTS = 10
const MAX_CHARS_PER_TEXT = 5000
const MAX_TARGETS = 10

export default defineEventHandler(async (event) => {
  const body = await readBody<TranslateRequest>(event)

  if (!body?.target) {
    throw createError({ statusCode: 400, statusMessage: 'Missing target language(s)' })
  }

  const targets = Array.isArray(body.target) ? body.target : [body.target]
  if (targets.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'At least one target language is required' })
  }
  if (targets.length > MAX_TARGETS) {
    throw createError({ statusCode: 400, statusMessage: `Maximum ${MAX_TARGETS} target languages allowed` })
  }

  const validTargets = validateTargetLanguages(targets)
  if (validTargets.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No valid target language codes provided. Use ISO 639-1 codes like fr, es, ja.' })
  }

  const texts = Array.isArray(body.text) ? body.text : [body.text]
  if (texts.length === 0 || (texts.length === 1 && !texts[0]?.trim())) {
    throw createError({ statusCode: 400, statusMessage: 'Missing text' })
  }
  if (texts.length > MAX_TEXTS) {
    throw createError({ statusCode: 400, statusMessage: `Maximum ${MAX_TEXTS} texts per request` })
  }
  for (const t of texts) {
    if (t.length > MAX_CHARS_PER_TEXT) {
      throw createError({ statusCode: 400, statusMessage: `Text exceeds ${MAX_CHARS_PER_TEXT} characters` })
    }
  }

  const key = await requireApiKey(event)
  await incrementUsage(event, key.id, key.limitPerDay, 3, key.userId)

  const db = getDb(event)
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, key.id))

  const { apiKey, model, fallbackModels } = await getApiKeyAndModels(event)
  if (!apiKey) {
    throw createError({ statusCode: 503, statusMessage: 'Translation service not configured — no OpenRouter API key set' })
  }

  const translations = await translateTexts(texts, validTargets, apiKey, model, fallbackModels)
  if (!translations) {
    throw createError({ statusCode: 502, statusMessage: 'Translation failed — all models returned errors' })
  }

  const flat = texts.flatMap((text, i) =>
    validTargets.map(target => ({
      detectedSource: body.source || undefined,
      target,
      text: translations[i]?.[target] ?? '',
    }))
  )

  const response: TranslateResponse = {
    translations: flat,
    model,
  }

  return response
})