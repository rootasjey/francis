import { vi, describe, expect, it, beforeEach } from 'vitest'
import { setupApiGlobals, createMockDb } from './setup/api-helper'

setupApiGlobals({ public: { appVersion: '0.1.0' } })

const mockDb = createMockDb()

vi.mock('../../server/db/client', () => ({ getDb: vi.fn(() => mockDb) }))
vi.mock('../../server/utils/config', () => ({
  getConfigMap: vi.fn(() => Promise.resolve({
    openrouter_api_key: { value: '', isSecret: true },
  })),
}))

function mockEvent() {
  return { context: { cloudflare: { env: { DB: {} } } } } as any
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/status', () => {
  it('should return overall status and checks', async () => {
    mockDb.run.mockResolvedValue({ success: true })

    const handler = (await import('../../server/api/status.get')).default
    const result = await handler(mockEvent())

    expect(result).toMatchObject({
      service: 'francis',
      status: 'degraded',
      ok: false,
    })
    expect(result.checks.api).toMatchObject({ status: 'ok' })
    expect(result.checks.database).toMatchObject({ status: 'ok' })
    expect(result.checks.kv).toMatchObject({ status: 'degraded' })
    expect(result.checks.openrouter).toMatchObject({ status: 'degraded' })
    expect(result.timestamp).toBeGreaterThan(0)
  })

  it('should report database down on error', async () => {
    mockDb.run.mockRejectedValue(new Error('DB connection failed'))

    const handler = (await import('../../server/api/status.get')).default
    const result = await handler(mockEvent())

    expect(result.checks.database).toMatchObject({ status: 'down' })
    expect(result.status).toBe('down')
  })
})
