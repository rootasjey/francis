# Intégration Polar — Francis

## Plan d'implémentation

### Phase 0 — Prérequis (compte Polar) ✅

- [x] Compte créé sur polar.sh
- [x] Organisation **GG CORP** créée (ID: `b45d3cbf-e83e-4d7e-aa80-5003801634b7`)
- [x] **Organization Access Token** généré : `polar_oat_KtKYmk0HVkQWHblcCTavs3nJxVneg3Eu3RCEa0hgcVD`
- [x] **Webhook Endpoint** créé : `https://francis.corpinot.cc/api/webhooks/polar` (secret: `whsec_d5OrfAHfbJ22e3CJnvTpozam71DV71u8X3SUo09doV2`)
- [x] Variables d'environnement ajoutées au `.env`

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

### Phase 3 — Produits et pricing ✅

- [x] **Meter** `api_requests` créé (ID: `0dfa31c0-cc45-4ecf-ad58-4f05a6762644`)
- [x] **Feature Flag benefit** `api_access` créé (ID: `4a8a3af0-06ba-4195-a3ce-707a4237865c`)
- [x] Produits créés via API Polar :

  | Tiers | Prix | Requêtes incluses | Prix excédent | Product ID |
  |-------|------|-------------------|---------------|------------|
  | **Hobby** | €9/mois | 5 000/mois | €0.002/req | `efb4c1a8-4560-475a-a84f-501f5ec36353` |
  | **Pro** | €49/mois | 50 000/mois | €0.001/req | `151479c7-30c1-460b-b5fc-5d97cda2f286` |
  | **Enterprise** | €199/mois | 500 000/mois | €0.0005/req | `806167c7-40cc-447e-a1ad-55da6ff1ea8c` |

- [x] `pricing.vue` mis à jour avec les vrais Product IDs

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

### Phase 7 — Contrôle d'accès ✅

- [x] Modifier `requireApiKey` dans `server/utils/auth.ts` pour vérifier l'abonnement via Customer State API
- [x] Fallback sur le système D1 si Polar est indisponible

### Phase 7b — WAF Rate Limiting (Cloudflare Pro) ✅

- [x] Supprimer le rate limiter in-memory dans `server/api/demo/translate.post.ts`
- [ ] Configurer une **WAF Rate Limiting Rule** dans le dashboard Cloudflare :
  - URI : `https://francis.corpinot.cc/api/demo/translate`
  - Méthode : POST
  - IP source : 3 requests / 10 seconds
  - Action : Block (429)

### Phase 8 — Customer Portal ✅

- [x] Créer `server/api/polar/portal.get.ts`

Endpoint : `GET /api/polar/portal` → redirige vers le customer portal Polar

### Phase 9 — UI ✅

- [x] Dashboard : ajouter une section abonnement (tier actuel, statut, boutons Manage/Upgrade)
- [x] Navigation : lien Pricing actif dans le menu
- [x] Nouvelle page `/pricing` présentant les 3 plans
- [ ] **TODO** : remplacer les `PRODUCT_ID_*` placeholders dans `app/pages/pricing.vue` par les vrais IDs Polar

### Phase 10 — Tests ✅

- [x] Tests unitaires : `test/unit/polar.test.ts` (utils avec SDK mocké)
- [x] Tests unitaires : `test/unit/auth.test.ts` (subscription check dans requireApiKey)
- [x] Tests d'intégration : `test/nuxt/api-polar.test.ts` (subscription, checkout, portal)
- [ ] Test manuel : checkout en sandbox Polar
- [ ] Test manuel : queue en local via `wrangler dev`

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
