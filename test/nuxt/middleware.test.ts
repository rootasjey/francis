import { vi, describe, expect, it, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockNavigateTo = vi.hoisted(() => vi.fn())
const mockFetch = vi.hoisted(() => vi.fn())

const mockSession = vi.hoisted(() => ({
  loggedIn: { value: false },
  user: { value: null },
  fetch: mockFetch,
}))

mockNuxtImport('useUserSession', () => () => mockSession)
mockNuxtImport('navigateTo', () => mockNavigateTo)

async function callMiddleware(fn: () => unknown) {
  try {
    return await fn()
  } catch (e) {
    return e
  }
}

beforeEach(() => {
  mockSession.loggedIn.value = false
  mockSession.user.value = null
  mockFetch.mockReset()
  mockNavigateTo.mockReset()
})

async function loadAuthMiddleware() {
  return (await import('../../app/middleware/auth')).default
}

async function loadGuestMiddleware() {
  return (await import('../../app/middleware/guest')).default
}

async function loadAdminMiddleware() {
  return (await import('../../app/middleware/admin')).default
}

describe('auth middleware', () => {
  it('should call fetch when not logged in', async () => {
    const middleware = await loadAuthMiddleware()
    await callMiddleware(middleware)
    expect(mockSession.fetch).toHaveBeenCalled()
  })

  it('should redirect to /login when not logged in', async () => {
    const middleware = await loadAuthMiddleware()
    await callMiddleware(middleware)
    expect(mockNavigateTo).toHaveBeenCalledWith('/login')
  })

  it('should not redirect when logged in', async () => {
    const middleware = await loadAuthMiddleware()
    mockSession.loggedIn.value = true
    await callMiddleware(middleware)
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })
})

describe('guest middleware', () => {
  it('should call fetch when not logged in', async () => {
    const middleware = await loadGuestMiddleware()
    await callMiddleware(middleware)
    expect(mockSession.fetch).toHaveBeenCalled()
  })

  it('should not redirect when not logged in', async () => {
    const middleware = await loadGuestMiddleware()
    await callMiddleware(middleware)
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })

  it('should redirect admin users to /admin', async () => {
    const middleware = await loadGuestMiddleware()
    mockSession.loggedIn.value = true
    mockSession.user.value = { role: 'admin' }
    await callMiddleware(middleware)
    expect(mockNavigateTo).toHaveBeenCalledWith('/admin')
  })

  it('should redirect regular users to /dashboard', async () => {
    const middleware = await loadGuestMiddleware()
    mockSession.loggedIn.value = true
    mockSession.user.value = { role: 'user' }
    await callMiddleware(middleware)
    expect(mockNavigateTo).toHaveBeenCalledWith('/dashboard')
  })
})

describe('admin middleware', () => {
  it('should call fetch when not logged in', async () => {
    const middleware = await loadAdminMiddleware()
    await callMiddleware(middleware)
    expect(mockSession.fetch).toHaveBeenCalled()
  })

  it('should redirect to /login when not logged in', async () => {
    const middleware = await loadAdminMiddleware()
    await callMiddleware(middleware)
    expect(mockNavigateTo).toHaveBeenCalledWith('/login')
  })

  it('should redirect non-admin to /dashboard', async () => {
    const middleware = await loadAdminMiddleware()
    mockSession.loggedIn.value = true
    mockSession.user.value = { role: 'user' }
    await callMiddleware(middleware)
    expect(mockNavigateTo).toHaveBeenCalledWith('/dashboard')
  })

  it('should allow admin users through', async () => {
    const middleware = await loadAdminMiddleware()
    mockSession.loggedIn.value = true
    mockSession.user.value = { role: 'admin' }
    await callMiddleware(middleware)
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })
})
