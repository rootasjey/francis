export type DetectRequest = {
  text: string
  minLength?: number
  only?: string[]
}

export type DetectAlternative = {
  language: string
  score: number
}

export type DetectResponse = {
  language: string
  score: number
  confidence: number
  alternatives: DetectAlternative[]
}

export type ApiError = {
  error: string
  code: string
  details?: string
}

export type ApiKeyRecord = {
  id: string
  name: string
  prefix: string
  limitPerDay: number
  createdAt: number
  lastUsedAt?: number | null
  revokedAt?: number | null
}

export type CreateKeyRequest = {
  name: string
  userId?: string
  limitPerDay?: number
}

export type UpdateKeyRequest = {
  name?: string
  limitPerDay?: number
}

export type CreateKeyResponse = {
  key: string
  record: ApiKeyRecord
}

export type ApiKeyListResponse = {
  items: ApiKeyRecord[]
}

export type UsageSummary = {
  day: string
  requests: number
}

export type UsageResponse = {
  apiKeyId: string
  items: UsageSummary[]
}

export type TranslateRequest = {
  text: string | string[]
  target: string | string[]
  source?: string
}

export type TranslateResult = {
  detectedSource?: string
  target: string
  text: string
}

export type TranslateResponse = {
  translations: TranslateResult[]
  model: string
}
