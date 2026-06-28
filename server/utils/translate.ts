interface Translation {
  fr: string
  es: string
  de: string
  it: string
}

interface TranslationResponse {
  [index: string]: Translation
}

const TRANSLATION_CACHE = new Map<string, Translation>()

async function translateOnce(
  texts: string[],
  apiKey: string,
  model: string,
): Promise<{ translations: Translation[], error?: string }> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://francis.verbatims.cc',
        'X-Title': 'Francis API',
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator. Given a JSON object mapping indices to text segments (which may be in English, French, or another language), return a JSON object with the same indices, each containing translations in French (fr), Spanish (es), German (de), and Italian (it). Return ONLY valid JSON. Preserve numbers, names, and code identifiers exactly. Keep the same tone and brevity.',
          },
          {
            role: 'user',
            content: JSON.stringify(texts.reduce<Record<string, string>>((acc, t, i) => {
              acc[String(i)] = t
              return acc
            }, {})),
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      const errorMsg = `HTTP ${response.status}${errorBody ? ` — ${errorBody.slice(0, 200)}` : ''}`
      return { translations: [], error: errorMsg }
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      return { translations: [], error: 'Empty response from model' }
    }

    try {
      const parsed = JSON.parse(content) as TranslationResponse
      const translations = texts.map((_, i) => {
        const t = parsed[String(i)]
        return {
          fr: t?.fr ?? '',
          es: t?.es ?? '',
          de: t?.de ?? '',
          it: t?.it ?? '',
        }
      })
      return { translations }
    } catch (parseErr) {
      return { translations: [], error: `Invalid JSON response: ${(parseErr as Error).message}` }
    }
  } catch (err) {
    return { translations: [], error: (err as Error).message }
  }
}

export async function translateBatch(
  texts: string[],
  apiKey: string,
  primaryModel: string,
  fallbackModels: string[] = [],
): Promise<Translation[] | null> {
  if (!apiKey) return null
  if (texts.length === 0) return []

  const cached: (Translation | null)[] = texts.map((t) => TRANSLATION_CACHE.get(t) ?? null)
  const missingIndices: number[] = []
  const missingTexts: string[] = []

  cached.forEach((c, i) => {
    if (c === null) {
      missingIndices.push(i)
      missingTexts.push(texts[i]!)
    }
  })

  if (missingTexts.length === 0) {
    return cached as Translation[]
  }

  const models = [primaryModel, ...fallbackModels].filter(m => m && m !== primaryModel)
  let translations: Translation[] | null = null

  for (let i = 0; i < models.length; i++) {
    const model = models[i]!
    const isPrimary = i === 0
    const label = isPrimary ? 'PRIMARY' : `FALLBACK #${i}`

    const result = await translateOnce(missingTexts, apiKey, model)

    if (result.translations.length > 0) {
      translations = result.translations
      if (isPrimary) {
        console.log(`[translate] ${label} ${model} succeeded`)
      } else {
        console.log(`[translate] ${label} ${model} succeeded after primary failed`)
      }
      break
    }

    if (isPrimary) {
      console.error(`[translate] PRIMARY ${primaryModel} failed: ${result.error} — trying ${fallbackModels.length} fallback(s)`)
    } else {
      console.warn(`[translate] ${label} ${model} failed: ${result.error}`)
    }
  }

  if (!translations) {
    console.error(`[translate] All ${models.length} model(s) failed: ${models.join(', ')}`)
    return null
  }

  missingTexts.forEach((text, i) => {
    TRANSLATION_CACHE.set(text, translations![i]!)
  })

  const result: Translation[] = [...cached] as Translation[]
  missingIndices.forEach((targetIdx, i) => {
    result[targetIdx] = translations![i]!
  })

  return result
}
