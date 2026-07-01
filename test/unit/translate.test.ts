import { vi, describe, expect, it, beforeEach } from 'vitest'
import { validateTargetLanguages, translateTexts, translateBatch } from '../../server/utils/translate'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('validateTargetLanguages', () => {
  it('should return valid ISO 639-1 codes', () => {
    expect(validateTargetLanguages(['fr', 'en', 'de'])).toEqual(['fr', 'en', 'de'])
  })

  it('should filter out invalid codes', () => {
    expect(validateTargetLanguages(['fr', 'invalid', 'zz', 'en'])).toEqual(['fr', 'en'])
  })

  it('should return empty array for no valid codes', () => {
    expect(validateTargetLanguages(['invalid', 'zz'])).toEqual([])
  })

  it('should return empty array for empty input', () => {
    expect(validateTargetLanguages([])).toEqual([])
  })
})

describe('translateTexts', () => {
  it('should return null when API key is empty', async () => {
    await expect(translateTexts(['any'], ['fr'], '', 'model')).resolves.toBeNull()
  })

  it('should return empty array when texts is empty', async () => {
    await expect(translateTexts([], ['fr'], 'key', 'model')).resolves.toEqual([])
  })

  it('should return empty array when targets is empty', async () => {
    await expect(translateTexts(['any'], [], 'key', 'model')).resolves.toEqual([])
  })

  it('should fetch and cache results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: JSON.stringify({ 0: { fr: 'bonjour' } }) } }],
      }),
    })

    const first = await translateTexts(['cache-test-a'], ['fr'], 'key', 'model')
    expect(first).toEqual([{ fr: 'bonjour' }])
    expect(mockFetch).toHaveBeenCalledTimes(1)

    const second = await translateTexts(['cache-test-a'], ['fr'], 'key', 'model')
    expect(second).toEqual([{ fr: 'bonjour' }])
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('should call the primary model on first request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: '{"0":{"fr":"bonjour"}}' } }],
      }),
    })

    await translateTexts(['primary-test'], ['fr'], 'test-key', 'primary-model')
    expect(mockFetch).toHaveBeenCalledTimes(1)

    const url = mockFetch.mock.calls[0][0]
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions')

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.model).toBe('primary-model')
  })

  it('should fallback to secondary models when primary fails', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: () => Promise.resolve('Rate limited'),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '{"0":{"fr":"bonjour"}}' } }],
        }),
      })

    const result = await translateTexts(
      ['fallback-test'],
      ['fr'],
      'test-key',
      'primary-model',
      ['fallback-model'],
    )

    expect(result).toEqual([{ fr: 'bonjour' }])
    expect(mockFetch).toHaveBeenCalledTimes(2)

    const secondBody = JSON.parse(mockFetch.mock.calls[1][1].body)
    expect(secondBody.model).toBe('fallback-model')
  })

  it('should return null when all models fail', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Server error'),
    })

    const result = await translateTexts(
      ['all-fail-test'],
      ['fr'],
      'test-key',
      'primary-model',
      ['fallback-1', 'fallback-2'],
    )

    expect(result).toBeNull()
  })

  it('should handle fetch errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const result = await translateTexts(['network-error-test'], ['fr'], 'test-key', 'primary-model')
    expect(result).toBeNull()
  })

  it('should handle malformed JSON response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'not-json' } }],
      }),
    })

    const result = await translateTexts(['bad-json-test'], ['fr'], 'test-key', 'primary-model')
    expect(result).toBeNull()
  })

  it('should cache by text and sorted targets', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: JSON.stringify({ 0: { fr: 'bonjour', es: 'hola' } }) } }],
      }),
    })

    const a = await translateTexts(['sorting-test'], ['fr', 'es'], 'key', 'm')
    expect(a).toEqual([{ fr: 'bonjour', es: 'hola' }])

    const b = await translateTexts(['sorting-test'], ['es', 'fr'], 'key', 'm')
    expect(b).toEqual([{ fr: 'bonjour', es: 'hola' }])

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})

describe('translateBatch', () => {
  it('should return null when translateTexts returns null', async () => {
    const result = await translateBatch(['batch-null-test'], '', 'model')
    expect(result).toBeNull()
  })

  it('should map results to fr/es/de/it object', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: JSON.stringify({
              0: { fr: 'bonjour', es: 'hola', de: 'hallo', it: 'ciao' },
            }),
          },
        }],
      }),
    })

    const result = await translateBatch(['batch-map-test'], 'test-key', 'primary-model')
    expect(result).toEqual([{ fr: 'bonjour', es: 'hola', de: 'hallo', it: 'ciao' }])
  })
})
