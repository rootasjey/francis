import { createError, getQuery, sendRedirect } from 'h3'
import { Polar } from '@polar-sh/sdk'
import { requireSessionUser } from '../../utils/session'
import { getOrCreatePolarCustomer, syncPolarCustomerId } from '../../utils/polar'

export default defineEventHandler(async (event) => {
  const session = await requireSessionUser(event)
  const config = useRuntimeConfig()

  const query = getQuery(event)
  const products = String(query.products || '')

  if (!products) {
    throw createError({ statusCode: 400, statusMessage: 'Missing products query param' })
  }

  const polar = new Polar({
    accessToken: config.polarAccessToken,
    server: config.polarServer as 'sandbox' | 'production',
  })

  const customer = await getOrCreatePolarCustomer(event, session.user)
  await syncPolarCustomerId(event, session.user.id, customer.id)

  const result = await polar.checkouts.create({
    products: products.split(',').map(p => p.trim()),
    customerId: customer.id,
    successUrl: config.polarCheckoutSuccessUrl,
  })

  await sendRedirect(event, result.url)
})
