import { createError, readBody } from 'h3'
import { francAll } from 'franc-all'
import type { DetectRequest, DetectResponse } from '../../../shared/types/api'
import { apiKeys } from '../../db/schema'
import { getDb } from '../../db/client'
import { incrementUsage, requireApiKey } from '../../utils/auth'
import { eq } from 'drizzle-orm'

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function computeConfidence(
  bestScore: number,
  nextScore: number | undefined,
  textLength: number,
): number {
  const normalizedBest = clamp01(1 - Math.min(bestScore, 1000) / 1000)
  const gap = nextScore !== undefined
    ? clamp01((nextScore - bestScore) / 1000)
    : 0.5
  const lengthBoost = clamp01(Math.min(textLength, 140) / 140)
  return clamp01(normalizedBest * 0.55 + gap * 0.25 + lengthBoost * 0.2)
}

export default defineEventHandler(async (event) => {
  const body = await readBody<DetectRequest>(event)

  if (!body?.text || body.text.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing text',
    })
  }

  const minLength = body.minLength ?? 10
  const only = body.only

  const key = await requireApiKey(event)

  await incrementUsage(event, key.id, key.limitPerDay)

  const db = getDb(event)
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, key.id))

  const raw = francAll(body.text, { minLength, only })
    .slice(0, 5)
    .map(([language, score]) => ({
      language,
      score,
    }))

  const top = raw[0]

  const alternatives: { language: string; score: number }[] = raw
  const textLength = body.text.trim().length

  const response: DetectResponse = {
    language: top?.language ?? 'und',
    score: top?.score ?? 0,
    confidence: top
      ? computeConfidence(top.score, raw[1]?.score, textLength)
      : 0,
    alternatives,
  }

  return response
})
