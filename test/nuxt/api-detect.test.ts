import { vi, describe, expect, it, beforeEach } from 'vitest'
import { setupApiGlobals, createMockDb, createMockQuery } from './setup/api-helper'

setupApiGlobals()

const mockDb = createMockDb()
const mockRequireApiKey = vi.fn()

vi.mock('../../server/db/client', () => ({ getDb: vi.fn(() => mockDb) }))
vi.mock('../../server/utils/auth', () => ({
  requireApiKey: mockRequireApiKey,
  incrementUsage: vi.fn(() => Promise.resolve('2025-01-01')),
}))
vi.mock('h3', async () => {
  const actual = await vi.importActual<typeof import('h3')>('h3')
  return {
    ...actual,
    readBody: vi.fn((event: any) => Promise.resolve(event.body)),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  mockRequireApiKey.mockResolvedValue({ id: 'key-1', limitPerDay: 10000 })
})

function mockEvent(body?: any) {
  return { body, context: { cloudflare: { env: { DB: {} } } } } as any
}

describe('POST /api/v1/detect', () => {
  it('should detect French text', async () => {
    const handler = (await import('../../server/api/v1/detect.post')).default
    const result = await handler(mockEvent({ text: 'Les sanglots longs des violons de l\'automne' }))
    expect(result.language).toBe('fra')
    expect(result.alternatives.length).toBeGreaterThan(0)
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('should detect English text among alternatives', async () => {
    const handler = (await import('../../server/api/v1/detect.post')).default
    const result = await handler(mockEvent({ text: 'The quick brown fox jumps over the lazy dog' }))
    const languages = result.alternatives.map((a: { language: string }) => a.language)
    expect(languages).toContain('eng')
  })

  it('should throw 400 for empty text', async () => {
    const handler = (await import('../../server/api/v1/detect.post')).default
    await expect(handler(mockEvent({ text: '' }))).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Missing text',
    })
  })

  it('should throw 400 for missing body', async () => {
    const handler = (await import('../../server/api/v1/detect.post')).default
    await expect(handler(mockEvent({}))).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  it('should respect only filter', async () => {
    const handler = (await import('../../server/api/v1/detect.post')).default
    const result = await handler(mockEvent({ text: 'Hello world', only: ['eng', 'fra'] }))
    expect(result.language).toBe('eng')
    for (const alt of result.alternatives) {
      expect(['eng', 'fra']).toContain(alt.language)
    }
  })

  it('should return und for very short text', async () => {
    const handler = (await import('../../server/api/v1/detect.post')).default
    const result = await handler(mockEvent({ text: 'Hi', minLength: 10 }))
    expect(result.language).toBe('und')
  })

  it('should return at most 5 alternatives', async () => {
    const handler = (await import('../../server/api/v1/detect.post')).default
    const result = await handler(mockEvent({ text: 'The quick brown fox jumps over the lazy dog' }))
    expect(result.alternatives.length).toBeLessThanOrEqual(5)
  })
})
