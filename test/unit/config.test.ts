import { vi, describe, expect, it, beforeEach } from 'vitest'

const mockUseRuntimeConfig = vi.fn()
vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig)

function createQuery(rows: unknown) {
  const q = {
    from: vi.fn(() => q),
    where: vi.fn(() => q),
    limit: vi.fn(() => q),
    then: vi.fn((resolve: (v: unknown) => void) => {
      resolve(rows)
    }),
  }
  return q
}


const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
}

vi.mock('../../server/db/client', () => ({
  getDb: vi.fn(() => mockDb),
}))

import { getConfig, getConfigMap, setConfig, getApiKeyAndModels, CONFIG_KEYS } from '../../server/utils/config'
import { appConfig } from '../../server/db/schema'

const mockEvent = {} as any

beforeEach(() => {
  vi.clearAllMocks()
  mockUseRuntimeConfig.mockReturnValue({
    openrouterApiKey: '',
    openrouterModel: 'google/gemini-3.1-flash-lite',
  })
})

describe('getConfig', () => {
  it('should return value from DB when present', async () => {
    const rows = [{ key: CONFIG_KEYS.openrouterModel, value: 'custom-model' }]
    mockDb.select.mockReturnValue(createQuery(rows))

    const value = await getConfig(mockEvent, CONFIG_KEYS.openrouterModel)
    expect(value).toBe('custom-model')
  })

  it('should fallback to env when DB is empty', async () => {
    mockDb.select.mockReturnValue(createQuery([]))

    const value = await getConfig(mockEvent, CONFIG_KEYS.openrouterModel)
    expect(value).toBe('google/gemini-3.1-flash-lite')
  })

  it('should fallback to env when DB throws', async () => {
    const failingQuery = {
      then: vi.fn(),
      from: vi.fn(() => failingQuery),
      where: vi.fn(() => ({
        then: vi.fn(),
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(() => Promise.reject(new Error('DB error'))),
        catch: vi.fn(),
      })),
      limit: vi.fn(() => failingQuery),
      catch: vi.fn(),
    }
    mockDb.select.mockReturnValue(failingQuery)

    const value = await getConfig(mockEvent, CONFIG_KEYS.openrouterModel)
    expect(value).toBe('google/gemini-3.1-flash-lite')
  })

  it('should return empty string for api key env fallback', async () => {
    mockDb.select.mockReturnValue(createQuery([]))

    const value = await getConfig(mockEvent, CONFIG_KEYS.openrouterApiKey)
    expect(value).toBe('')
  })
})

describe('getConfigMap', () => {
  it('should merge DB rows with env fallbacks', async () => {
    const rows = [
      { key: CONFIG_KEYS.openrouterModel, value: 'override-model', isSecret: false, updatedAt: new Date('2025-01-01'), updatedBy: 'admin' },
    ]
    mockDb.select.mockReturnValue(createQuery(rows))

    const map = await getConfigMap(mockEvent)
    expect(map[CONFIG_KEYS.openrouterModel].value).toBe('override-model')
    expect(map[CONFIG_KEYS.openrouterApiKey].value).toBe('')
    expect(map[CONFIG_KEYS.openrouterApiKey].isSecret).toBe(true)
  })

  it('should handle DB errors gracefully', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn(() => Promise.reject(new Error('DB error'))),
    })

    const map = await getConfigMap(mockEvent)
    expect(map[CONFIG_KEYS.openrouterApiKey].value).toBe('')
    expect(map[CONFIG_KEYS.openrouterModel].value).toBe('google/gemini-3.1-flash-lite')
  })

  it('should mark keys and secrets as isSecret', async () => {
    mockDb.select.mockReturnValue(createQuery([]))

    const map = await getConfigMap(mockEvent)
    expect(map[CONFIG_KEYS.openrouterApiKey].isSecret).toBe(true)
    expect(map[CONFIG_KEYS.openrouterModel].isSecret).toBe(false)
    expect(map[CONFIG_KEYS.openrouterFallbackModels].isSecret).toBe(false)
  })
})

describe('setConfig', () => {
  it('should insert a new config value', async () => {
    const insertChain = {
      values: vi.fn(() => ({
        onConflictDoUpdate: vi.fn(() => Promise.resolve()),
      })),
    }
    mockDb.insert.mockReturnValue(insertChain)

    await setConfig(mockEvent, CONFIG_KEYS.openrouterModel, 'new-model', 'admin')

    expect(mockDb.insert).toHaveBeenCalledWith(appConfig)
    expect(insertChain.values).toHaveBeenCalled()
  })

  it('should mark keys as secret', async () => {
    let capturedValues: any
    const insertChain = {
      values: vi.fn((v: any) => {
        capturedValues = v
        return { onConflictDoUpdate: vi.fn(() => Promise.resolve()) }
      }),
    }
    mockDb.insert.mockReturnValue(insertChain)

    await setConfig(mockEvent, CONFIG_KEYS.openrouterApiKey, 'sk-123', 'admin')

    expect(capturedValues.isSecret).toBe(true)
  })

  it('should mark non-keys as non-secret', async () => {
    let capturedValues: any
    const insertChain = {
      values: vi.fn((v: any) => {
        capturedValues = v
        return { onConflictDoUpdate: vi.fn(() => Promise.resolve()) }
      }),
    }
    mockDb.insert.mockReturnValue(insertChain)

    await setConfig(mockEvent, CONFIG_KEYS.openrouterModel, 'model', 'admin')

    expect(capturedValues.isSecret).toBe(false)
  })
})

describe('getApiKeyAndModels', () => {
  it('should return combined api key, model and fallbacks', async () => {
    mockDb.select.mockReturnValue(createQuery([]))

    const result = await getApiKeyAndModels(mockEvent)
    expect(result).toEqual({
      apiKey: '',
      model: 'google/gemini-3.1-flash-lite',
      fallbackModels: ['google/gemini-2.0-flash-001', 'openai/gpt-4o-mini', 'anthropic/claude-3.5-haiku'],
    })
  })

  it('should return empty fallbacks when DB contains invalid JSON', async () => {
    mockDb.select
      .mockReturnValueOnce(createQuery([]))
      .mockReturnValueOnce(createQuery([]))
      .mockReturnValueOnce(createQuery([{ key: CONFIG_KEYS.openrouterFallbackModels, value: 'not-json' }]))

    const result = await getApiKeyAndModels(mockEvent)
    expect(result.apiKey).toBe('')
    expect(result.model).toBe('google/gemini-3.1-flash-lite')
    expect(result.fallbackModels).toEqual([])
  })

  it('should read from DB when values are stored', async () => {
    const findByKey = (key: string) => {
      const store: Record<string, any> = {
        [CONFIG_KEYS.openrouterApiKey]: { key: CONFIG_KEYS.openrouterApiKey, value: 'db-key' },
        [CONFIG_KEYS.openrouterModel]: { key: CONFIG_KEYS.openrouterModel, value: 'db-model' },
        [CONFIG_KEYS.openrouterFallbackModels]: { key: CONFIG_KEYS.openrouterFallbackModels, value: '["db-fallback"]' },
      }
      return createQuery([store[key]].filter(Boolean))
    }

    mockDb.select
      .mockReturnValueOnce(findByKey(CONFIG_KEYS.openrouterApiKey))
      .mockReturnValueOnce(findByKey(CONFIG_KEYS.openrouterModel))
      .mockReturnValueOnce(findByKey(CONFIG_KEYS.openrouterFallbackModels))

    const result = await getApiKeyAndModels(mockEvent)
    expect(result).toEqual({
      apiKey: 'db-key',
      model: 'db-model',
      fallbackModels: ['db-fallback'],
    })
  })
})
