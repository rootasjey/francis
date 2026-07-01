import { vi, describe, expect, it, beforeEach } from 'vitest'

const mockCustomers = {
  getByExternalId: vi.fn(),
  create: vi.fn(),
}

const MockPolar = vi.fn(function () {
  return { customers: mockCustomers }
})

vi.mock('@polar-sh/sdk', () => ({
  Polar: MockPolar,
}))

const mockUseRuntimeConfig = vi.fn()
vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig)

const mockDb = {
  update: vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  })),
}

vi.mock('../../server/db/client', () => ({
  getDb: vi.fn(() => mockDb),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

const mockEvent = { context: { cloudflare: { env: { DB: {} } } } } as any

describe('getPolarClient', () => {
  it('should create a Polar client with sandbox server by default', async () => {
    mockUseRuntimeConfig.mockReturnValue({
      polarAccessToken: 'test-token',
      polarServer: 'sandbox',
    })

    const { getPolarClient } = await import('../../server/utils/polar')
    const { Polar } = await import('@polar-sh/sdk')

    const client = getPolarClient(mockEvent)
    expect(Polar).toHaveBeenCalledWith({
      accessToken: 'test-token',
      server: 'sandbox',
    })
    expect(client.customers).toBe(mockCustomers)
  })

  it('should use production server when configured', async () => {
    mockUseRuntimeConfig.mockReturnValue({
      polarAccessToken: 'test-token',
      polarServer: 'production',
    })

    const { getPolarClient } = await import('../../server/utils/polar')
    const { Polar } = await import('@polar-sh/sdk')

    getPolarClient(mockEvent)
    expect(Polar).toHaveBeenCalledWith({
      accessToken: 'test-token',
      server: 'production',
    })
  })

  it('should throw when polarAccessToken is missing', async () => {
    mockUseRuntimeConfig.mockReturnValue({
      polarAccessToken: '',
      polarServer: 'sandbox',
    })

    const { getPolarClient } = await import('../../server/utils/polar')
    expect(() => getPolarClient(mockEvent)).toThrow('Polar not configured')
  })
})

describe('getOrCreatePolarCustomer', () => {
  it('should return existing customer when found by external ID', async () => {
    mockUseRuntimeConfig.mockReturnValue({
      polarAccessToken: 'test-token',
      polarServer: 'sandbox',
    })

    const existingCustomer = { id: 'polar-cus-123', email: 'test@test.com' }
    mockCustomers.getByExternalId.mockResolvedValue(existingCustomer)

    const { getOrCreatePolarCustomer } = await import('../../server/utils/polar')
    const result = await getOrCreatePolarCustomer(mockEvent, {
      id: 'user-1',
      email: 'test@test.com',
    })

    expect(result).toEqual(existingCustomer)
    expect(mockCustomers.getByExternalId).toHaveBeenCalledWith({
      externalId: 'user-1',
    })
    expect(mockCustomers.create).not.toHaveBeenCalled()
  })

  it('should create a new customer when not found', async () => {
    mockUseRuntimeConfig.mockReturnValue({
      polarAccessToken: 'test-token',
      polarServer: 'sandbox',
    })

    mockCustomers.getByExternalId.mockRejectedValue(new Error('Not found'))
    const newCustomer = { id: 'polar-cus-456', email: 'new@test.com' }
    mockCustomers.create.mockResolvedValue(newCustomer)

    const { getOrCreatePolarCustomer } = await import('../../server/utils/polar')
    const result = await getOrCreatePolarCustomer(mockEvent, {
      id: 'user-2',
      email: 'new@test.com',
      name: 'New User',
    })

    expect(result).toEqual(newCustomer)
    expect(mockCustomers.create).toHaveBeenCalledWith({
      email: 'new@test.com',
      name: 'New User',
      externalId: 'user-2',
    })
  })
})

describe('syncPolarCustomerId', () => {
  it('should update polarCustomerId for the user', async () => {
    const { syncPolarCustomerId } = await import('../../server/utils/polar')

    await syncPolarCustomerId(mockEvent, 'user-1', 'polar-cus-123')

    expect(mockDb.update).toHaveBeenCalled()
  })
})
