import { createError, readBody, getRequestIP } from 'h3'
import type { TranslateRequest, TranslateResponse } from '../../../shared/types/api'
import { translateTexts, validateTargetLanguages } from '../../utils/translate'
import { getApiKeyAndModels } from '../../utils/config'

const RATE_LIMIT_WINDOW = 10_000
const MAX_REQUESTS_PER_WINDOW = 3
const ipHits = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipHits.get(ip)
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) return false
  entry.count++
  return true
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (!checkRateLimit(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many demo requests — try again in a few seconds' })
  }

  const body = await readBody<TranslateRequest>(event)

  if (!body?.target) {
    throw createError({ statusCode: 400, statusMessage: 'Missing target language(s)' })
  }

  const targets = Array.isArray(body.target) ? body.target : [body.target]
  if (targets.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'At least one target language is required' })
  }
  if (targets.length > 5) {
    throw createError({ statusCode: 400, statusMessage: 'Maximum 5 target languages in demo' })
  }

  const validTargets = validateTargetLanguages(targets)
  if (validTargets.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No valid target language codes' })
  }

  const text = typeof body.text === 'string' ? body.text : body.text?.[0]
  if (!text?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing text' })
  }
  if (text.length > 500) {
    throw createError({ statusCode: 400, statusMessage: 'Demo limited to 500 characters' })
  }

  const { apiKey, model, fallbackModels } = await getApiKeyAndModels(event)
  if (!apiKey) {
    throw createError({ statusCode: 503, statusMessage: 'Translation service not configured' })
  }

  const translations = await translateTexts([text], validTargets, apiKey, model, fallbackModels)
  if (!translations) {
    throw createError({ statusCode: 502, statusMessage: 'Translation failed' })
  }

  const flat = validTargets.map(target => ({
    target,
    text: translations[0]?.[target] ?? '',
  }))

  const response: TranslateResponse = {
    translations: flat,
    model,
  }

  return response
})