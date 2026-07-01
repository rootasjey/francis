import { vi, describe, expect, it, beforeEach } from 'vitest'
import { setupApiGlobals } from './test-utils'

setupApiGlobals()

const mockEvent = {} as any

describe('GET /api/v1/health', () => {
  it('should return ok status', async () => {
    const handler = (await import('../../server/api/v1/health.get')).default
    const result = await handler()
    expect(result).toMatchObject({ ok: true, service: 'francis' })
    expect(result.timestamp).toBeGreaterThan(0)
  })
})

const mockClearUserSession = vi.fn(() => Promise.resolve(true))
const mockGetUserSession = vi.fn()

vi.mock('../../server/utils/session', () => ({
  clearUserSession: mockClearUserSession,
  getUserSession: mockGetUserSession,
}))

beforeEach(() => {
  mockClearUserSession.mockClear()
  mockGetUserSession.mockClear()
})

describe('POST /api/auth/logout', () => {
  it('should clear session and return ok', async () => {
    const handler = (await import('../../server/api/auth/logout.post')).default
    const result = await handler(mockEvent)
    expect(result).toEqual({ ok: true })
    expect(mockClearUserSession).toHaveBeenCalled()
  })
})

describe('GET /api/auth/me', () => {
  it('should return null user when not logged in', async () => {
    mockGetUserSession.mockResolvedValue({ id: '', user: undefined })

    const handler = (await import('../../server/api/auth/me.get')).default
    const result = await handler(mockEvent)
    expect(result).toEqual({ user: null })
  })

  it('should return user when logged in', async () => {
    mockGetUserSession.mockResolvedValue({
      id: 'session-1',
      user: { id: '1', email: 'test@test.com', role: 'user' },
    })

    const handler = (await import('../../server/api/auth/me.get')).default
    const result = await handler(mockEvent)
    expect(result).toEqual({ user: { id: '1', email: 'test@test.com', role: 'user' } })
  })
})
