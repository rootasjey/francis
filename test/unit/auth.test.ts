import { vi, describe, expect, it, beforeEach } from 'vitest'

const mockPolarCustomers = { getStateByExternalId: vi.fn() }
const mockPolarInstance = { customers: mockPolarCustomers }
let mockPolarConstructor = vi.fn(() => mockPolarInstance)

vi.mock('@polar-sh/sdk', () => ({
  Polar: vi.fn(function () {
    return mockPolarInstance
  }),
}))

const mockUseRuntimeConfig = vi.fn()
vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig)

vi.stubGlobal('defineEventHandler', (handler: Function) => handler)

const mockHashKey = vi.fn()
const mockNormalizeKey = vi.fn()

vi.mock('../../server/utils/api-key', () => ({
  hashKey: mockHashKey,
  normalizeKey: mockNormalizeKey,
}))

const mockDb = {
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve([])),
    })),
  })),
}

vi.mock('../../server/db/client', () => ({
  getDb: vi.fn(() => mockDb),
}))

vi.mock('h3', async () => {
  const actual = await vi.importActual<typeof import('h3')>('h3')
  return {
    ...actual,
    getRequestHeader: vi.fn((_event: any, name: string) => {
      if (name === 'x-api-key') return 'fcs_test_key'
      if (name === 'authorization') return null
      return null
    }),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

const mockEvent = {
  context: { cloudflare: { env: {} } },
  path: '/api/v1/detect',
} as any

describe('requireApiKey subscription check', () => {
  it('should bypass Polar check when polarAccessToken is not configured', async () => {
    mockUseRuntimeConfig.mockReturnValue({ polarAccessToken: '' })
    mockNormalizeKey.mockReturnValue('fcs_test_key')
    mockHashKey.mockResolvedValue('hashed')
    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ id: 'key-1', userId: 'user-1', limitPerDay: 10000 }])),
      })),
    })

    const { requireApiKey } = await import('../../server/utils/auth')
    const result = await requireApiKey(mockEvent)
    expect(result.id).toBe('key-1')
  })

  it('should pass when user has an active subscription', async () => {
    mockUseRuntimeConfig.mockReturnValue({ polarAccessToken: 'test-token' })
    mockNormalizeKey.mockReturnValue('fcs_test_key')
    mockHashKey.mockResolvedValue('hashed')
    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ id: 'key-1', userId: 'user-1', limitPerDay: 10000 }])),
      })),
    })
    mockPolarCustomers.getStateByExternalId.mockResolvedValue({
      activeSubscriptions: [{ id: 'sub-1', status: 'active' }],
      grantedBenefits: [],
    })

    const { requireApiKey } = await import('../../server/utils/auth')
    const result = await requireApiKey(mockEvent)
    expect(result.id).toBe('key-1')
  })

  it('should pass when user has api_access feature flag but no subscription', async () => {
    mockUseRuntimeConfig.mockReturnValue({ polarAccessToken: 'test-token' })
    mockNormalizeKey.mockReturnValue('fcs_test_key')
    mockHashKey.mockResolvedValue('hashed')
    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ id: 'key-1', userId: 'user-1', limitPerDay: 10000 }])),
      })),
    })
    mockPolarCustomers.getStateByExternalId.mockResolvedValue({
      activeSubscriptions: [],
      grantedBenefits: [{ type: 'feature_flag', properties: { flag: 'api_access' } }],
    })

    const { requireApiKey } = await import('../../server/utils/auth')
    const result = await requireApiKey(mockEvent)
    expect(result.id).toBe('key-1')
  })

  it('should throw 402 when user has no subscription and no feature flag', async () => {
    mockUseRuntimeConfig.mockReturnValue({ polarAccessToken: 'test-token' })
    mockNormalizeKey.mockReturnValue('fcs_test_key')
    mockHashKey.mockResolvedValue('hashed')
    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ id: 'key-1', userId: 'user-1', limitPerDay: 10000 }])),
      })),
    })
    mockPolarCustomers.getStateByExternalId.mockResolvedValue({
      activeSubscriptions: [],
      grantedBenefits: [],
    })

    const { requireApiKey } = await import('../../server/utils/auth')
    await expect(requireApiKey(mockEvent)).rejects.toMatchObject({
      statusCode: 402,
    })
  })

  it('should fallback gracefully when Polar is unavailable', async () => {
    mockUseRuntimeConfig.mockReturnValue({ polarAccessToken: 'test-token' })
    mockNormalizeKey.mockReturnValue('fcs_test_key')
    mockHashKey.mockResolvedValue('hashed')
    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ id: 'key-1', userId: 'user-1', limitPerDay: 10000 }])),
      })),
    })
    mockPolarCustomers.getStateByExternalId.mockRejectedValue(new Error('Network error'))

    const { requireApiKey } = await import('../../server/utils/auth')
    const result = await requireApiKey(mockEvent)
    expect(result.id).toBe('key-1')
  })

  it('should not check Polar when key has no userId', async () => {
    mockUseRuntimeConfig.mockReturnValue({ polarAccessToken: 'test-token' })
    mockNormalizeKey.mockReturnValue('fcs_test_key')
    mockHashKey.mockResolvedValue('hashed')
    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ id: 'key-1', userId: null, limitPerDay: 10000 }])),
      })),
    })

    const { requireApiKey } = await import('../../server/utils/auth')
    const result = await requireApiKey(mockEvent)
    expect(result.id).toBe('key-1')
    expect(mockPolarCustomers.getStateByExternalId).not.toHaveBeenCalled()
  })
})
