import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const changelogContent = readFileSync(new URL('./CHANGELOG.md', import.meta.url), 'utf-8')

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  hub: {
    blob: true,
    cache: true,
    db: 'sqlite',
    kv: true,
  },

  modules: [
    '@nuxt/test-utils', 
    '@pinia/nuxt', 
    '@una-ui/nuxt',
    'nuxt-auth-utils',
    '@vueuse/nuxt',
    '@nuxthub/core',
    '@polar-sh/nuxt'
  ],

  nitro: {
    virtual: {
      '#changelog-content': `export default ${JSON.stringify(changelogContent)}`,
    },
    preset: 'cloudflare-module',
    experimental: {
      wasm: true
    },
    ignore: ['scripts/**'],
    cloudflare: {
      wrangler: {
        queues: {
          producers: [
            {
              queue: 'polar-events',
              binding: 'POLAR_EVENTS_QUEUE',
            },
          ],
          consumers: [
            {
              queue: 'polar-events',
              max_batch_size: 10,
              max_retries: 5,
            },
          ],
        },
      },
    },
  },

  runtimeConfig: {
    apiDefaultLimit: Number(process.env.NUXT_API_DEFAULT_LIMIT || '10000'),
    apiMaxLimit: Number(process.env.NUXT_API_MAX_LIMIT || '100000'),
    openrouterApiKey: process.env.NUXT_OPENROUTER_API_KEY || '',
    openrouterModel: process.env.NUXT_OPENROUTER_MODEL || 'google/gemini-3.1-flash-lite',
    polarAccessToken: process.env.NUXT_POLAR_ACCESS_TOKEN || '',
    polarWebhookSecret: process.env.NUXT_POLAR_WEBHOOK_SECRET || '',
    polarOrganizationId: process.env.NUXT_POLAR_ORGANIZATION_ID || '',
    polarServer: process.env.NUXT_POLAR_SERVER || 'sandbox',
    polarCheckoutSuccessUrl: process.env.NUXT_POLAR_CHECKOUT_SUCCESS_URL || 'http://localhost:3000/dashboard',
    // Public keys (exposed to client-side)
    public: {
      authUrl: process.env.NUXT_AUTH_ORIGIN || 'http://localhost:3000',
      // Injected at build time; used in UI (About, header, footer)
      appVersion: computeVersion(),
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://francis.corpinot.cc',
      // Bump to invalidate all previously rendered OG images
      ogStyleVersion: process.env.NUXT_PUBLIC_OG_STYLE_VERSION || '1'
    }
  },

  unocss: {
    preflight: true,
    icons: {
      scale: 1.0,
      extraProperties: {
        "display": "inline-block",
        "vertical-align": "middle",
      },
    },
    theme: {
      colors: {
        primary: {
          DEFAULT: '#3C82F6',
          50: '#E6F2FA',
          100: '#C3E4F5',
          200: '#99D1F0',
          300: '#66BFFB',
          400: '#34AEEF',
          500: '#3C82F6',
          600: '#0D89C8',
          700: '#007AAD',
          800: '#006488',
          900: '#004D66',
        },
        secondary: {
          DEFAULT: '#FAA533',
          50: '#FFF3E6',
          100: '#FEE0B8',
          200: '#FDC78A',
          300: '#FDB15A',
          400: '#FF9A1F',
          500: '#FAA533',
          600: '#E88C00',
          700: '#B84217',
          800: '#993715',
          900: '#7A2C12',
        },
        accent: {
          DEFAULT: '#FF8C42',
          50: '#FFF3E6',
          100: '#FFE0C2',
          200: '#FFC299',
          300: '#FFA366',
          400: '#FF8C42',
          500: '#FF7A26',
          600: '#E66A1A',
          700: '#CC5A10',
          800: '#994308',
          900: '#662D04',
        },
      },
    },
  },
  una: {
    // switched prefix from U -> N so Una UI components become <N...>
    // (we also remove the explicit NIcon alias later to avoid a naming collision)
    prefix: "N",
    themeable: true,
  },
})

function computeVersion(): string {
  // Prefer latest git tag like v1.2.3; fallback to package.json version
  try {
    const tag = execSync("git describe --tags --match 'v[0-9]*.[0-9]*.[0-9]*' --abbrev=0", {
      stdio: ['ignore', 'pipe', 'ignore']
    }).toString().trim()
    return tag.replace(/^v/, '')
  } catch {}

  try {
    const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8') as unknown as string)
    return pkg.version || '0.0.0'
  } catch {}

  return '0.0.0'
}
