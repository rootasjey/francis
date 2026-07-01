import { vi, describe, expect, it, beforeEach } from 'vitest'
import { setupApiGlobals, createMockDb, createMockQuery, makeMockEvent } from './test-utils'

setupApiGlobals({
  polarAccessToken: 'test-polar-token',
  polarServer: 'sandbox',
  polarCheckoutSuccessUrl: 'http://localhost:3000/dashboard',
})

const mockDb = createMockDb()
const mockRequireSessionUser = vi.fn()
const mockPolarCustomers = { getByExternalId: vi.fn(), create: vi.fn() }
const mockPolarCheckouts = { create: vi.fn() }
const mockPolarCustomerSessions = { create: vi.fn() }
const mockSendRedirect = vi.fn()

vi.mock('../../server/db/client', () => ({ getDb: vi.fn(() => mockDb) }))
vi.mock('../../server/utils/session', () => ({
  requireSessionUser: mockRequireSessionUser,
  getUserSession: mockRequireSessionUser,
}))
vi.mock('../../server/utils/polar', () => ({
  getOrCreatePolarCustomer: vi.fn((_event: any, user: any) =>
    Promise.resolve({ id: `polar-${user.id}`, email: user.email }),
  ),
  syncPolarCustomerId: vi.fn(() => Promise.resolve()),
}))
vi.mock('@polar-sh/sdk', () => ({
  Polar: vi.fn(function () {
    return {
      customers: mockPolarCustomers,
      checkouts: mockPolarCheckouts,
      customerSessions: mockPolarCustomerSessions,
    }
  }),
}))

const mockCustomerPortalHandler = vi.fn()
vi.stubGlobal('CustomerPortal', vi.fn(function () {
  return mockCustomerPortalHandler
}))
vi.mock('h3', async () => {
  const actual = await vi.importActual<typeof import('h3')>('h3')
  return {
    ...actual,
    sendRedirect: mockSendRedirect,
    readBody: vi.fn((event: any) => Promise.resolve(event.body)),
  }
})

function makeQueryEvent(query: Record<string, string>) {
  const params = new URLSearchParams(query)
  const mockWriteHead = vi.fn()
  const mockEnd = vi.fn()
  return {
    body: undefined,
    params: undefined,
    context: { cloudflare: { env: { DB: {} } } },
    path: `/api/polar/checkout?${params.toString()}`,
    node: {
      req: { headers: {} },
      res: {
        writeHead: mockWriteHead,
        end: mockEnd,
        setHeader: vi.fn(),
        getHeader: vi.fn(() => undefined),
        statusCode: 200,
      },
    },
  } as any
}

beforeEach(() => {
  vi.clearAllMocks()
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/polar/subscription', () => {
  it('should return subscription data for authenticated user', async () => {
    mockRequireSessionUser.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com', role: 'user' },
    })
    mockDb.select.mockReturnValue(
      createMockQuery([{
        polarCustomerId: 'polar-cus-123',
        polarSubscriptionStatus: 'active',
        polarProductTier: 'pro',
        subscriptionEndsAt: new Date('2026-12-31'),
      }]),
    )

    const handler = (await import('../../server/api/polar/subscription.get')).default
    const result = await handler(makeMockEvent())

    expect(result).toMatchObject({
      tier: 'pro',
      status: 'active',
      customerId: 'polar-cus-123',
    })
    expect(result.endsAt).toBeGreaterThan(0)
  })

  it('should return nulls when user has no subscription', async () => {
    mockRequireSessionUser.mockResolvedValue({
      user: { id: 'user-2', email: 'test@test.com', role: 'user' },
    })
    mockDb.select.mockReturnValue(
      createMockQuery([{
        polarCustomerId: null,
        polarSubscriptionStatus: null,
        polarProductTier: null,
        subscriptionEndsAt: null,
      }]),
    )

    const handler = (await import('../../server/api/polar/subscription.get')).default
    const result = await handler(makeMockEvent())

    expect(result).toMatchObject({
      tier: null,
      status: null,
      customerId: null,
      endsAt: null,
    })
  })
})

describe('POST /api/polar/checkout', () => {
  it('should create customer and redirect to Polar checkout', async () => {
    mockRequireSessionUser.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com', name: 'Test', role: 'user' },
    })

    mockPolarCheckouts.create.mockResolvedValue({
      url: 'https://checkout.polar.sh/session-abc',
    })

    const handler = (await import('../../server/api/polar/checkout.post')).default
    await handler(makeQueryEvent({ products: 'prod-hobby' }))

    expect(mockPolarCheckouts.create).toHaveBeenCalledWith({
      products: ['prod-hobby'],
      customerId: 'polar-user-1',
      successUrl: expect.any(String),
    })
  })

  it('should create Polar customer when not found', async () => {
    mockRequireSessionUser.mockResolvedValue({
      user: { id: 'user-new', email: 'new@test.com', name: null, role: 'user' },
    })

    mockPolarCheckouts.create.mockResolvedValue({
      url: 'https://checkout.polar.sh/session-new',
    })

    const handler = (await import('../../server/api/polar/checkout.post')).default
    await handler(makeQueryEvent({ products: 'prod-pro' }))

    expect(mockPolarCheckouts.create).toHaveBeenCalledWith({
      products: ['prod-pro'],
      customerId: 'polar-user-new',
      successUrl: expect.any(String),
    })
  })

  it('should throw 400 when products query param is missing', async () => {
    mockRequireSessionUser.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com', role: 'user' },
    })

    const handler = (await import('../../server/api/polar/checkout.post')).default
    await expect(handler(makeQueryEvent({}))).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Missing products query param',
    })
  })
})

describe('GET /api/polar/portal', () => {
  it('should redirect to Polar customer portal', async () => {
    mockRequireSessionUser.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com', role: 'user' },
    })

    mockDb.select.mockReturnValue(
      createMockQuery([{ polarCustomerId: 'polar-cus-123' }]),
    )

    const handler = (await import('../../server/api/polar/portal.get')).default
    const event = makeMockEvent()
    await handler(event)

    expect(mockCustomerPortalHandler).toHaveBeenCalledWith(event)
  })

  it('should throw 404 when user has no Polar customer', async () => {
    mockRequireSessionUser.mockResolvedValue({
      user: { id: 'user-2', email: 'test@test.com', role: 'user' },
    })

    mockDb.select.mockReturnValue(createMockQuery([{ polarCustomerId: null }]))

    const handler = (await import('../../server/api/polar/portal.get')).default
    await expect(handler(makeMockEvent())).rejects.toMatchObject({
      statusCode: 404,
    })
  })
})
