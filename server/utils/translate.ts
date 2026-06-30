const TRANSLATION_CACHE = new Map<string, Record<string, string>>()

function buildPrompt(targets: string[], sourceHint?: string): string {
  const langSpec = targets.map(t => `${languageName(t)} (${t})`).join(', ')
  const sourceNote = sourceHint
    ? ` which may be in ${languageName(sourceHint)} or another language`
    : ''
  return `You are a professional translator. Given a JSON object mapping indices to text segments${sourceNote}, return a JSON object with the same indices, each containing translations into the following languages: ${langSpec}. Use the two-letter codes as keys. Return ONLY valid JSON. Preserve numbers, names, and code identifiers exactly. Keep the same tone and brevity.`
}

const LANGUAGE_NAMES: Record<string, string> = {
  af: 'Afrikaans', sq: 'Albanian', am: 'Amharic', ar: 'Arabic', hy: 'Armenian',
  az: 'Azerbaijani', eu: 'Basque', be: 'Belarusian', bn: 'Bengali', bs: 'Bosnian',
  bg: 'Bulgarian', ca: 'Catalan', ceb: 'Cebuano', ny: 'Chichewa', zh: 'Chinese',
  co: 'Corsican', hr: 'Croatian', cs: 'Czech', da: 'Danish', nl: 'Dutch',
  en: 'English', eo: 'Esperanto', et: 'Estonian', tl: 'Filipino', fi: 'Finnish',
  fr: 'French', fy: 'Frisian', gl: 'Galician', ka: 'Georgian', de: 'German',
  el: 'Greek', gu: 'Gujarati', ht: 'Haitian Creole', ha: 'Hausa', haw: 'Hawaiian',
  he: 'Hebrew', hi: 'Hindi', hmn: 'Hmong', hu: 'Hungarian', is: 'Icelandic',
  ig: 'Igbo', id: 'Indonesian', ga: 'Irish', it: 'Italian', ja: 'Japanese',
  jw: 'Javanese', kn: 'Kannada', kk: 'Kazakh', km: 'Khmer', rw: 'Kinyarwanda',
  ko: 'Korean', ku: 'Kurdish', ky: 'Kyrgyz', lo: 'Lao', la: 'Latin',
  lv: 'Latvian', lt: 'Lithuanian', lb: 'Luxembourgish', mk: 'Macedonian',
  mg: 'Malagasy', ms: 'Malay', ml: 'Malayalam', mt: 'Maltese', mi: 'Maori',
  mr: 'Marathi', mn: 'Mongolian', my: 'Myanmar', ne: 'Nepali', no: 'Norwegian',
  or: 'Odia', ps: 'Pashto', fa: 'Persian', pl: 'Polish', pt: 'Portuguese',
  pa: 'Punjabi', ro: 'Romanian', ru: 'Russian', sm: 'Samoan', gd: 'Scots Gaelic',
  sr: 'Serbian', st: 'Sesotho', sn: 'Shona', sd: 'Sindhi', si: 'Sinhala',
  sk: 'Slovak', sl: 'Slovenian', so: 'Somali', es: 'Spanish', su: 'Sundanese',
  sw: 'Swahili', sv: 'Swedish', tg: 'Tajik', ta: 'Tamil', tt: 'Tatar',
  te: 'Telugu', th: 'Thai', tr: 'Turkish', tk: 'Turkmen', uk: 'Ukrainian',
  ur: 'Urdu', ug: 'Uyghur', uz: 'Uzbek', vi: 'Vietnamese', cy: 'Welsh',
  xh: 'Xhosa', yi: 'Yiddish', yo: 'Yoruba', zu: 'Zulu',
}

function languageName(code: string): string {
  return LANGUAGE_NAMES[code] ?? code
}

const ISO_639_1_CODES = new Set(Object.keys(LANGUAGE_NAMES))

async function translateOnce(
  texts: string[],
  targets: string[],
  apiKey: string,
  model: string,
): Promise<{ translations: Record<string, string>[], error?: string }> {
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
        max_tokens: 3000,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: buildPrompt(targets),
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
      const parsed = JSON.parse(content) as Record<string, Record<string, string>>
      const translations = texts.map((_, i) => parsed[String(i)] ?? {})
      return { translations }
    } catch (parseErr) {
      return { translations: [], error: `Invalid JSON response: ${(parseErr as Error).message}` }
    }
  } catch (err) {
    return { translations: [], error: (err as Error).message }
  }
}

export async function translateTexts(
  texts: string[],
  targets: string[],
  apiKey: string,
  primaryModel: string,
  fallbackModels: string[] = [],
): Promise<Record<string, string>[] | null> {
  if (!apiKey) return null
  if (texts.length === 0 || targets.length === 0) return []

  const cacheKey = (text: string) => `${text}::${[...targets].sort().join(',')}`
  const cached: (Record<string, string> | null)[] = texts.map(t => TRANSLATION_CACHE.get(cacheKey(t)) ?? null)
  const missingIndices: number[] = []
  const missingTexts: string[] = []

  cached.forEach((c, i) => {
    if (c === null) {
      missingIndices.push(i)
      missingTexts.push(texts[i]!)
    }
  })

  if (missingTexts.length === 0) {
    return cached as Record<string, string>[]
  }

  const models = [primaryModel, ...fallbackModels].filter(m => m && m !== primaryModel)
  let translations: Record<string, string>[] | null = null

  for (let i = 0; i < models.length; i++) {
    const model = models[i]!
    const isPrimary = i === 0
    const label = isPrimary ? 'PRIMARY' : `FALLBACK #${i}`

    const result = await translateOnce(missingTexts, targets, apiKey, model)

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
    TRANSLATION_CACHE.set(cacheKey(text), translations![i]!)
  })

  const result: (Record<string, string> | null)[] = [...cached]
  missingIndices.forEach((targetIdx, i) => {
    result[targetIdx] = translations![i]!
  })

  return result as Record<string, string>[]
}

export async function translateBatch(
  texts: string[],
  apiKey: string,
  primaryModel: string,
  fallbackModels: string[] = [],
): Promise<{ fr: string; es: string; de: string; it: string }[] | null> {
  const results = await translateTexts(texts, ['fr', 'es', 'de', 'it'], apiKey, primaryModel, fallbackModels)
  if (!results) return null
  return results.map(r => ({
    fr: r.fr ?? '',
    es: r.es ?? '',
    de: r.de ?? '',
    it: r.it ?? '',
  }))
}

export function validateTargetLanguages(targets: string[]): string[] {
  return targets.filter(t => ISO_639_1_CODES.has(t))
}