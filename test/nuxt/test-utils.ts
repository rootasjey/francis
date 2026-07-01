import { vi } from 'vitest'

export function setupApiGlobals(config?: Record<string, unknown>) {
  vi.stubGlobal('defineEventHandler', (handler: Function) => handler)
  vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
    session: { password: 'test-session-password-32-chars-long!!!' },
    public: { appVersion: '0.1.0' },
    apiDefaultLimit: 10000,
    apiMaxLimit: 100000,
    openrouterApiKey: '',
    openrouterModel: 'test-model',
    ...config,
  })))
}

export function createMockQuery<T>(rows: T) {
  const q = {
    from: vi.fn(() => q),
    where: vi.fn(() => q),
    limit: vi.fn(() => q),
    orderBy: vi.fn(() => q),
    then: vi.fn((resolve: (v: unknown) => void) => resolve(rows)),
  }
  return q
}

export function createMockDb() {
  return {
    select: vi.fn(() => createMockQuery([])),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoUpdate: vi.fn(() => Promise.resolve()),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
    run: vi.fn(() => Promise.resolve()),
  }
}

export function mockReadBody() {
  vi.mock('h3', async () => {
    const actual = await vi.importActual<typeof import('h3')>('h3')
    return {
      ...actual,
      readBody: vi.fn((event: any) => Promise.resolve(event.body)),
      getRouterParam: vi.fn((event: any, name: string) => event.params?.[name]),
    }
  })
}

export function makeMockEvent(body?: any, params?: Record<string, string>) {
  return { body, params, context: { cloudflare: { env: { DB: {} } } } } as any
}

export function mockError(result: unknown) {
  const err = result as Error & { statusCode?: number; statusMessage?: string }
  if (err?.statusCode) return err
  return null
}
