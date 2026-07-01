import { vi, describe, expect, it, beforeEach } from 'vitest'
import { setupApiGlobals, createMockDb, createMockQuery } from './setup/api-helper'

setupApiGlobals()

const mockDb = createMockDb()
const mockRequireSessionUser = vi.fn()

vi.mock('../../server/db/client', () => ({ getDb: vi.fn(() => mockDb) }))
vi.mock('../../server/utils/session', () => ({
  requireSessionUser: mockRequireSessionUser,
}))
vi.mock('h3', async () => {
  const actual = await vi.importActual<typeof import('h3')>('h3')
  return {
    ...actual,
    readBody: vi.fn((event: any) => Promise.resolve(event.body)),
    getRouterParam: vi.fn((event: any, name: string) => event.params?.[name]),
  }
})

function mockEvent(body?: any, params?: Record<string, string>) {
  return { body, params, context: { cloudflare: { env: { DB: {} } } } } as any
}

beforeEach(() => {
  vi.clearAllMocks()
  mockRequireSessionUser.mockResolvedValue({ user: { id: 'user-1', role: 'user' } })
})

describe('GET /api/v1/keys', () => {
  it('should list keys for regular user', async () => {
    mockDb.select.mockReturnValue(createMockQuery([
      { id: 'key-1', name: 'My Key', prefix: 'fcs_abc', limitPerDay: 1000, createdAt: new Date('2025-01-01'), lastUsedAt: null, revokedAt: null },
    ]))

    const handler = (await import('../../server/api/v1/keys.get')).default
    const result = await handler(mockEvent())
    expect(result.items).toHaveLength(1)
    expect(result.items[0].name).toBe('My Key')
  })

  it('should list all keys for admin', async () => {
    mockRequireSessionUser.mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } })
    mockDb.select.mockReturnValue(createMockQuery([
      { id: 'key-1', name: 'Admin Key', prefix: 'fcs_abc', limitPerDay: 1000, createdAt: new Date('2025-01-01'), lastUsedAt: null, revokedAt: null },
    ]))

    const handler = (await import('../../server/api/v1/keys.get')).default
    const result = await handler(mockEvent())
    expect(result.items).toHaveLength(1)
  })
})

describe('POST /api/v1/keys', () => {
  it('should create a new API key', async () => {
    const handler = (await import('../../server/api/v1/keys.post')).default
    const result = await handler(mockEvent({ name: 'Test Key' }))
    expect(result.key).toMatch(/^fcs_/)
    expect(result.record.name).toBe('Test Key')
  })

  it('should throw 400 for missing name', async () => {
    const handler = (await import('../../server/api/v1/keys.post')).default
    await expect(handler(mockEvent({}))).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Missing key name',
    })
  })
})

describe('DELETE /api/v1/keys/[id]', () => {
  it('should revoke a key', async () => {
    mockDb.select.mockReturnValue(createMockQuery([{ id: 'key-1', userId: 'user-1' }]))

    const handler = (await import('../../server/api/v1/keys/[id].delete')).default
    const result = await handler(mockEvent(undefined, { id: 'key-1' }))
    expect(result).toEqual({ ok: true })
  })

  it('should throw 404 for non-existent key', async () => {
    mockDb.select.mockReturnValue(createMockQuery([]))

    const handler = (await import('../../server/api/v1/keys/[id].delete')).default
    await expect(handler(mockEvent(undefined, { id: 'missing' }))).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Key not found',
    })
  })

  it('should throw 403 for other user key', async () => {
    mockDb.select.mockReturnValue(createMockQuery([{ id: 'key-1', userId: 'other-user' }]))

    const handler = (await import('../../server/api/v1/keys/[id].delete')).default
    await expect(handler(mockEvent(undefined, { id: 'key-1' }))).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  })
})

describe('PATCH /api/v1/keys/[id]', () => {
  it('should update key name', async () => {
    const now = new Date('2025-06-15')
    mockDb.select
      .mockReturnValueOnce(createMockQuery([{ id: 'key-1', userId: 'user-1' }]))
      .mockReturnValueOnce(createMockQuery([{
        id: 'key-1', name: 'Updated Key', prefix: 'fcs_abc',
        limitPerDay: 1000, createdAt: now, lastUsedAt: null, revokedAt: null,
      }]))
    const updated = (await import('../../server/api/v1/keys/[id].patch')).default

    const result = await updated(mockEvent({ name: 'Updated Key' }, { id: 'key-1' }))
    expect(result.name).toBe('Updated Key')
  })

  it('should throw 400 for empty name', async () => {
    const handler = (await import('../../server/api/v1/keys/[id].patch')).default
    await expect(handler(mockEvent({ name: '  ' }, { id: 'key-1' }))).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Key name cannot be empty',
    })
  })
})
