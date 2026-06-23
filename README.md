# Francis

Language detection API powered by [franc-all](https://github.com/wooorm/franc) on Cloudflare Workers. Built for [Verbatims](https://github.com/rootasjey/verbatims).

## Architecture

Francis is a **Nuxt 4 + NuxtHub** app deployed on Cloudflare Workers with D1 (SQLite). It wraps `franc-all` in an authenticated HTTP API with usage tracking and key management.

```
┌─────────────┐     POST /api/v1/detect     ┌──────────────┐
│  Verbatims  │ ──────────────────────────►  │   Francis    │
│  (Worker)   │    x-api-key: fcs_****      │   (Worker)   │
└─────────────┘                              │   + D1 DB    │
       ▲                                      └──────────────┘
       │  { language: "fra", score: 0.8, ... }
       └──────────────────────────────────────
```

## Directory structure

```
francis/
├── app/
│   ├── app.vue                   # Root Vue component
│   ├── layouts/default.vue       # App shell (header, footer, theme toggle)
│   ├── pages/                    # Route pages (Nuxt 4 convention)
│   │   ├── index.vue
│   │   ├── login.vue
│   │   ├── signup.vue
│   │   ├── dashboard/index.vue
│   │   └── admin/index.vue
│   ├── middleware/                # Route guards (auth, guest, admin)
│   └── composables/              # Shared composables
├── server/
│   ├── api/                      # API endpoints
│   │   ├── auth/                 #  login, signup, logout, me
│   │   └── v1/                   #  detect, keys, usage, health
│   ├── db/                       # D1 schema + migrations
│   ├── plugins/seed.ts           # Auto-seed admin on first deploy
│   └── utils/                    # api-key, auth, password, session
├── shared/types/                 # Shared TypeScript types
├── test/unit/                    # Vitest unit tests
├── nuxt.config.ts
└── wrangler.jsonc
```

> **Note:** Nuxt 4 defaults to `srcDir: 'app/'`. Page files, layouts, middleware, and
> composables live under `app/`. The `server/` and `shared/` directories stay at
> the project root regardless.

## API

### `POST /api/v1/detect`

Detect the language of a text.

**Headers:** `x-api-key: fcs_<your_key>`

**Body:**
```json
{
  "text": "Les sanglots longs des violons",
  "minLength": 10,
  "only": ["fra", "eng", "spa"]
}
```

**Response:**
```json
{
  "language": "fra",
  "score": 64,
  "confidence": 0.77,
  "alternatives": [
    { "language": "fra", "score": 64 },
    { "language": "cat", "score": 193 },
    { "language": "spa", "score": 213 }
  ]
}
```

- `language`: ISO 639-3 code (e.g. `fra`, `eng`, `und`)
- `score`: franc distance (lower = better match)
- `confidence`: 0–1 score combining best distance, gap to next alternative, and text length
- `alternatives`: top 5 candidates with scores

### `GET /api/v1/health`

```json
{ "ok": true, "service": "francis", "timestamp": 1719000000000 }
```

## Setup

```bash
# Install dependencies
bun install

# Copy env
cp .env.example .env
# Edit .env with your session password

# Run dev
bun dev
```

## Deploy

```bash
# Create D1 database
bunx wrangler d1 create francis

# Copy the database ID into wrangler.jsonc

# Set secrets
bunx wrangler secret put NUXT_SESSION_PASSWORD
bunx wrangler secret put NUXT_ADMIN_EMAIL
bunx wrangler secret put NUXT_ADMIN_PASSWORD

# Deploy
bun run build
bunx wrangler --cwd .output deploy

# Visit the site, sign up — first user becomes admin
# Generate an API key from the admin panel
```

## Integration with Verbatims

On the Verbatims side, add a server endpoint:

```typescript
// server/api/detect-language.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody<{ text: string }>(event)
  const runtimeConfig = useRuntimeConfig()

  const response = await $fetch('https://francis.verbatims.cc/api/v1/detect', {
    method: 'POST',
    headers: { 'x-api-key': runtimeConfig.francisApiKey },
    body: { text: body.text, minLength: 12, only: ['eng','fra','lat','spa','deu','ita','por','rus','jpn','cmn','zho'] },
  })

  return response
})
```

Then in `nuxt.config.ts`:
```typescript
runtimeConfig: {
  francisApiKey: process.env.NUXT_FRANCIS_API_KEY || '',
}
```

And in `useQuoteForm.ts`, replace `import('franc-min')` with `$fetch('/api/detect-language', { body: { text } })`.
