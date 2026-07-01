import { vi, describe, expect, it, beforeEach } from 'vitest'

const mockUseRuntimeConfig = vi.fn()
vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig)

const mockSessionStore: { data: Record<string, unknown> } = { data: {} }

vi.mock('h3', () => {
  const createError = vi.fn((opts: { statusCode?: number; statusMessage?: string }) => {
    const err: Error & { statusCode?: number; statusMessage?: string } = new Error(opts.statusMessage)
    err.statusCode = opts.statusCode
    err.statusMessage = opts.statusMessage
    return err
  })

  const useSession = vi.fn(() => ({
    id: 'test-session-id',
    data: mockSessionStore.data,
    update: vi.fn((data: Record<string, unknown>) => {
      Object.assign(mockSessionStore.data, data)
    }),
    clear: vi.fn(() => {
      for (const k of Object.keys(mockSessionStore.data)) {
        delete mockSessionStore.data[k]
      }
    }),
  }))

  return { createError, useSession }
})

import { getUserSession, setUserSession, clearUserSession, requireSessionUser } from '../../server/utils/session'

const mockEvent = {} as any

beforeEach(() => {
  vi.clearAllMocks()
  mockUseRuntimeConfig.mockReturnValue({
    session: { password: 'test-session-password-at-least-32-chars' },
  })
  for (const k of Object.keys(mockSessionStore.data)) {
    delete mockSessionStore.data[k]
  }
})

describe('getUserSession', () => {
  it('should return session data', async () => {
    mockSessionStore.data.user = { id: '1', email: 'test@test.com', role: 'user' }
    const session = await getUserSession(mockEvent)
    expect(session.user?.email).toBe('test@test.com')
  })

  it('should return session with default id', async () => {
    const session = await getUserSession(mockEvent)
    expect(session.id).toBe('test-session-id')
  })

  it('should return empty session when no data', async () => {
    const session = await getUserSession(mockEvent)
    expect(session.user).toBeUndefined()
  })
})

describe('setUserSession', () => {
  it('should store user data in session', async () => {
    const data = { user: { id: '1', email: 'a@b.com', role: 'user' as const }, loggedInAt: Date.now() }
    const session = await setUserSession(mockEvent, data)
    expect(session.user?.email).toBe('a@b.com')
  })

  it('should persist data across calls', async () => {
    await setUserSession(mockEvent, { user: { id: '1', email: 'a@b.com', role: 'user' } })
    const session = await getUserSession(mockEvent)
    expect(session.user?.email).toBe('a@b.com')
  })
})

describe('clearUserSession', () => {
  it('should clear session data', async () => {
    await setUserSession(mockEvent, { user: { id: '1', email: 'a@b.com', role: 'user' } })
    await clearUserSession(mockEvent)
    const session = await getUserSession(mockEvent)
    expect(session.user).toBeUndefined()
  })

  it('should return true', async () => {
    await expect(clearUserSession(mockEvent)).resolves.toBe(true)
  })
})

describe('requireSessionUser', () => {
  it('should return session when user exists', async () => {
    mockSessionStore.data.user = { id: '1', email: 'a@b.com', role: 'user' }
    const session = await requireSessionUser(mockEvent)
    expect(session.user.email).toBe('a@b.com')
  })

  it('should throw 401 when no user', async () => {
    await expect(requireSessionUser(mockEvent)).rejects.toThrow('Unauthorized')
  })

  it('should throw custom status code and message', async () => {
    await expect(
      requireSessionUser(mockEvent, { statusCode: 403, message: 'Forbidden' }),
    ).rejects.toMatchObject({ statusCode: 403, statusMessage: 'Forbidden' })
  })
})

describe('getSessionConfig (internal)', () => {
  it('should throw 500 when session password is missing', async () => {
    mockUseRuntimeConfig.mockReturnValueOnce({} as any)

    await expect(getUserSession(mockEvent)).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Missing session password',
    })
  })
})
