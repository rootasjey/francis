import { defineNitroPlugin } from 'nitropack/runtime/plugin'
import { Polar } from '@polar-sh/sdk'

interface QueueEvent {
  name: string
  externalCustomerId: string
  metadata: Record<string, string | number | boolean>
  timestamp: string
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('cloudflare:queue', async ({ batch }: { batch: MessageBatch<QueueEvent> }) => {
    const polarAccessToken = process.env.NUXT_POLAR_ACCESS_TOKEN
    const polarServer = process.env.NUXT_POLAR_SERVER || 'sandbox'
    if (!polarAccessToken) return

    const polar = new Polar({
      accessToken: polarAccessToken,
      server: polarServer as 'sandbox' | 'production',
    })

    const events = batch.messages
      .map(msg => msg.body)
      .filter(msg => msg.externalCustomerId)

    if (events.length === 0) {
      batch.ackAll()
      return
    }

    try {
      await polar.events.ingest({
        events: events.map(e => ({
          name: e.name,
          externalCustomerId: e.externalCustomerId,
          metadata: e.metadata,
          timestamp: e.timestamp,
        })),
      })
      batch.ackAll()
    } catch (err) {
      console.error('[polar-queue] Ingestion failed, retrying:', err)
      batch.retryAll()
    }
  })
})
