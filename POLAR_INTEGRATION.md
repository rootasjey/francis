# Intégration Polar — Francis

## Plan d'implémentation

### Phase 0 — Prérequis (compte Polar)

- [ ] Créer un compte sur https://polar.sh/signup
- [ ] Créer une organisation
- [ ] Générer un **Organization Access Token** (Settings → Organization → Access Tokens)
- [ ] Créer un **Webhook Endpoint** pointant vers `https://francis.corpinot.cc/api/webhooks/polar`
- [ ] Récupérer le **Webhook Secret**
- [ ] Ajouter les variables d'environnement (voir `.env.example`)

### Phase 1 — Configuration et dépendances ✅

- [x] Installer `@polar-sh/nuxt`
- [x] Ajouter le module dans `nuxt.config.ts`
- [x] Configurer `runtimeConfig` (accessToken, webhookSecret, organizationId, server, successUrl)
- [x] Déclarer la Cloudflare Queue `polar-events` (producer + consumer)
- [x] Mettre à jour `.env.example`

### Phase 2 — Base de données ✅

- [x] Ajouter les colonnes Polar à `users` (schema.ts)
- [x] Créer la migration `0003_polar.sql`
- [x] Appliquer la migration en local
- [ ] Appliquer la migration sur la base distante :
  ```bash
  npx wrangler d1 migrations apply francis --remote
  ```

### Phase 3 — Produits et pricing (dashboard Polar)

- [ ] Créer les produits suivants dans le dashboard Polar (Products → Create Product) :

  | Tiers | Type | Prix | Requêtes incluses | Prix excédent |
  |-------|------|------|-------------------|---------------|
  | **Hobby** | Subscription | $9/mois | 5 000/mois | $0.002/req |
  | **Pro** | Subscription | $49/mois | 50 000/mois | $0.001/req |
  | **Enterprise** | Subscription | $199/mois | 500 000/mois | $0.0005/req |

- [ ] Créer un **Meter** nommé `api_requests` (agrège le champ `requests` des events)
- [ ] Ajouter un **Metered Unit Price** à chaque produit lié au meter `api_requests`
- [ ] Ajouter un **Feature Flag benefit** `api_access` sur chaque produit
- [ ] Noter les **Product IDs** de chaque tier (nécessaires pour le checkout)

### Phase 4 — Checkout ✅

- [x] Créer `server/utils/polar.ts` (client helper + customer management)
- [x] Créer `server/api/polar/checkout.post.ts`

Endpoint : `POST /api/polar/checkout?products=PRODUCT_ID`

### Phase 5 — Webhooks ✅

- [x] Créer `server/api/webhooks/polar.post.ts`

Endpoint enregistré dans Polar : `https://francis.corpinot.cc/api/webhooks/polar`

Événements gérés :
- `subscription.created` / `subscription.active` / `subscription.updated`
- `subscription.canceled` / `subscription.revoked`
- `customer.state_changed`

### Phase 6 — Ingestion d'events (Cloudflare Queue)

- [ ] Créer le consumer de queue `server/plugins/queue-consumer.ts`
- [ ] Modifier `incrementUsage` dans `server/utils/auth.ts` pour envoyer les events dans la queue

### Phase 7 — Contrôle d'accès

- [ ] Modifier `requireApiKey` dans `server/utils/auth.ts` pour vérifier l'abonnement via Customer State API
- [ ] Fallback sur le système D1 si Polar est indisponible

### Phase 7b — WAF Rate Limiting (optionnel, Cloudflare Pro)

- [ ] Configurer une WAF Rate Limiting Rule dans le dashboard Cloudflare :
  - URI : `https://francis.corpinot.cc/api/demo/translate`
  - Méthode : POST
  - IP source : 3 requests / 10 seconds
  - Action : Block (429)
- [ ] Supprimer le rate limiter in-memory dans `server/api/demo/translate.post.ts`

### Phase 8 — Customer Portal

- [ ] Créer `server/api/polar/portal.get.ts`

Endpoint : `GET /api/polar/portal` → redirige vers le customer portal Polar

### Phase 9 — UI

- [ ] Dashboard : ajouter une section abonnement (tier actuel, statut, usage du mois, boutons Manage/Upgrade)
- [ ] Admin : stats abonnés, revenue estimé
- [ ] Nouvelle page `/pricing` présentant les 3 plans

### Phase 10 — Tests

- [ ] Tester le checkout en sandbox Polar
- [ ] Vérifier le fallback gracieux (Polar down → D1 continue)
- [ ] Vérifier le `402 Payment Required`
- [ ] Tester la queue en local via `wrangler dev`

---

## Actions manuelles — Dashboard Polar

### Créer le webhook endpoint

1. Dans Polar, aller dans Settings → Webhooks
2. Créer un endpoint : `https://francis.corpinot.cc/api/webhooks/polar`
3. Copier le **Webhook Secret** et l'ajouter dans `.env` : `NUXT_POLAR_WEBHOOK_SECRET=...`
4. Sélectionner les événements : `customer.state_changed`, `subscription.*`

### Créer les produits

1. Dans Polar, aller dans Products → Create Product
2. Créer chaque tier (Hobby, Pro, Enterprise) en Subscription
3. Ajouter un Metered Unit Price lié au meter `api_requests`
4. Copier les **Product IDs** depuis l'URL de chaque produit

### Créer le meter

1. Dans Polar, aller dans Meters → Create Meter
2. Nom : `api_requests`
3. Filter : `name = "api_request"`
4. Aggregation : `sum(metadata.requests)`

### Créer le feature flag benefit

1. Dans Polar, aller dans Benefits → Create Benefit
2. Type : Feature Flag
3. Key : `api_access`
4. Ajouter ce benefit à chaque produit

### Créer l'Organization Access Token

1. Dans Polar, Settings → Organization → Access Tokens
2. Générer un token
3. L'ajouter dans `.env` : `NUXT_POLAR_ACCESS_TOKEN=...`

---

## Variables d'environnement

```env
NUXT_POLAR_ACCESS_TOKEN=           # Organization Access Token (Polar)
NUXT_POLAR_WEBHOOK_SECRET=         # Webhook Secret (Polar)
NUXT_POLAR_ORGANIZATION_ID=        # Organization ID (Polar)
NUXT_POLAR_SERVER=sandbox          # sandbox | production
NUXT_POLAR_CHECKOUT_SUCCESS_URL=   # Redirect après checkout réussi
```

---

## Commandes utiles

```bash
# Créer la queue
npx wrangler queues create polar-events

# Appliquer les migrations D1
npx wrangler d1 migrations apply francis --local
npx wrangler d1 migrations apply francis --remote

# Tester en local
npx wrangler dev

# Déployer
npx wrangler deploy
```

---

## Architecture des events ingérés

```json
{
  "name": "api_request",
  "external_customer_id": "<user_id>",
  "metadata": {
    "requests": 1,
    "api_key_id": "<key_id>",
    "endpoint": "/api/v1/detect",
    "method": "POST"
  },
  "timestamp": "2026-07-01T12:00:00Z"
}
```
