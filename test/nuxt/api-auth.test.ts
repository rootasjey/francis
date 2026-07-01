import { vi, describe, expect, it, beforeEach } from 'vitest'
import { setupApiGlobals, createMockDb, mockEvent } from './setup/api-helper'

setupApiGlobals()

const mockDb = createMockDb()
const mockSetUserSession = vi.fn()
const mockVerifyPassword = vi.fn()
const mockHashPassword = vi.fn()

vi.mock('../../server/db/client', () => ({ getDb: vi.fn(() => mockDb) }))
vi.mock('../../server/utils/session', () => ({ setUserSession: mockSetUserSession }))
vi.mock('../../server/utils/password', () => ({
  verifyPassword: mockVerifyPassword,
  hashPassword: mockHashPassword,
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
})

describe('POST /api/auth/login', () => {
  const validBody = { email: 'test@test.com', password: 'password123' }

  it('should throw 400 for missing email', async () => {
    const handler = (await import('../../server/api/auth/login.post')).default
    await expect(handler({ ...mockEvent, body: { password: 'pwd' } })).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Invalid credentials',
    })
  })

  it('should throw 400 for missing password', async () => {
    const handler = (await import('../../server/api/auth/login.post')).default
    await expect(handler({ ...mockEvent, body: { email: 'test@test.com' } })).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Invalid credentials',
    })
  })

  it('should throw 401 when user not found', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([])) })),
    })

    const handler = (await import('../../server/api/auth/login.post')).default
    await expect(handler({ ...mockEvent, body: validBody })).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  })

  it('should throw 401 when password is invalid', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ id: '1', email: 'test@test.com', passwordHash: 'hash', name: null, role: 'user' }])),
      })),
    })
    mockVerifyPassword.mockResolvedValue(false)

    const handler = (await import('../../server/api/auth/login.post')).default
    await expect(handler({ ...mockEvent, body: validBody })).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  })

  it('should login successfully and set session', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ id: '1', email: 'test@test.com', passwordHash: 'hash', name: 'Test', role: 'user' }])),
      })),
    })
    mockVerifyPassword.mockResolvedValue(true)

    const handler = (await import('../../server/api/auth/login.post')).default
    const result = await handler({ ...mockEvent, body: validBody })
    expect(result.user).toMatchObject({ id: '1', email: 'test@test.com', name: 'Test', role: 'user' })
    expect(mockSetUserSession).toHaveBeenCalled()
    expect(mockSetUserSession.mock.calls[0][1].user.email).toBe('test@test.com')
  })
})

describe('POST /api/auth/signup', () => {
  const validBody = { email: 'new@test.com', password: 'password123', name: 'New' }

  it('should throw 400 for invalid email', async () => {
    const handler = (await import('../../server/api/auth/signup.post')).default
    await expect(handler({ ...mockEvent, body: { email: 'bad', password: 'password123' } })).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Invalid email',
    })
  })

  it('should throw 400 for short password', async () => {
    const handler = (await import('../../server/api/auth/signup.post')).default
    await expect(handler({ ...mockEvent, body: { email: 'a@b.com', password: 'short' } })).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Password too short',
    })
  })

  it('should throw 409 when email already exists', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ id: '1' }])),
        limit: vi.fn(() => Promise.resolve([])),
      })),
    })

    const handler = (await import('../../server/api/auth/signup.post')).default
    await expect(handler({ ...mockEvent, body: validBody })).rejects.toMatchObject({
      statusCode: 409,
      statusMessage: 'Email already registered',
    })
  })

  it('should create user and log in', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
        limit: vi.fn(() => Promise.resolve([])),
      })),
    })
    mockHashPassword.mockResolvedValue('hashed-password')

    const handler = (await import('../../server/api/auth/signup.post')).default
    const result = await handler({ ...mockEvent, body: validBody })
    expect(result.user.email).toBe('new@test.com')
    expect(result.user.role).toBe('admin')
    expect(mockSetUserSession).toHaveBeenCalled()
  })

  it('should assign user role when first user already exists', async () => {
    let callCount = 0
    mockDb.select.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return { from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([])) })) }
      }
      return { from: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ id: 'existing' }])) })) }
    })
    mockHashPassword.mockResolvedValue('hashed-password')

    const handler = (await import('../../server/api/auth/signup.post')).default
    const result = await handler({ ...mockEvent, body: validBody })
    expect(result.user.role).toBe('user')
  })
})
