<template>
  <section class="space-y-10">
    <div>
      <h1 class="text-3xl font-semibold">Admin</h1>
      <p class="text-sm text-muted-foreground">Manage API keys, limits, and billing-ready metadata.</p>
    </div>

    <div class="rounded-2xl border border-border bg-card p-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold">Admin session</h2>
          <p class="text-xs text-muted-foreground">Signed in as {{ session.user.value?.email }}</p>
        </div>
        <button
          class="rounded-lg border border-border bg-muted px-4 py-2 text-xs font-semibold text-foreground"
          @click="logout"
        >
          Sign out
        </button>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div class="rounded-2xl border border-border bg-card p-6">
        <h2 class="text-lg font-semibold">Create API key</h2>
        <div class="mt-4 grid gap-4">
          <div>
            <label class="text-xs text-muted-foreground">Key name</label>
            <input
              v-model="form.name"
              class="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
              placeholder="Verbatims production"
            />
          </div>
          <div>
            <label class="text-xs text-muted-foreground">Daily limit</label>
            <input
              v-model="form.limitPerDay"
              class="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
              placeholder="10000"
            />
          </div>
          <button
            class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            :disabled="creating"
            @click="createKey"
          >
            {{ creating ? 'Generating&hellip;' : 'Generate key' }}
          </button>
          <p v-if="createError" class="text-xs text-rose-400">{{ createError }}</p>
          <div v-if="createdKey" class="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3">
            <p class="text-xs text-emerald-400">New key (copy now):</p>
            <p class="mt-1 text-sm text-emerald-400">{{ createdKey }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-card p-6">
        <h2 class="text-lg font-semibold">Billing readiness</h2>
        <ul class="mt-4 space-y-3 text-sm text-muted-foreground">
          <li class="flex items-start gap-3">
            <span class="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
            Store per-key daily usage summaries.
          </li>
          <li class="flex items-start gap-3">
            <span class="mt-1 h-2 w-2 rounded-full bg-blue-400" />
            Attach plan metadata per key (limit + price).
          </li>
          <li class="flex items-start gap-3">
            <span class="mt-1 h-2 w-2 rounded-full bg-amber-400" />
            Export monthly rollups to billing provider.
          </li>
        </ul>
      </div>
    </div>

    <div class="rounded-2xl border border-border bg-card p-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">API keys</h2>
        <button
          class="rounded-lg border border-border bg-muted px-3 py-1 text-xs text-muted-foreground"
          :disabled="keysPending"
          @click="refreshKeys"
        >
          Refresh
        </button>
      </div>

      <p v-if="keysError" class="mt-3 text-xs text-rose-400">Failed to load keys.</p>

      <div class="mt-4 space-y-3">
        <div
          v-for="key in keys"
          :key="key.id"
          class="rounded-xl border border-border bg-muted p-4"
        >
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium">{{ key.name }}</p>
              <p class="mt-1 text-xs text-muted-foreground">{{ key.prefix }}&bullet;&bullet;&bullet;&bullet;</p>
            </div>
            <button
              class="rounded-lg border border-rose-400/40 px-3 py-1 text-xs text-rose-400"
              @click="revokeKey(key.id)"
            >
              Revoke
            </button>
          </div>
          <div class="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Limit: {{ key.limitPerDay.toLocaleString() }}/day</span>
            <span v-if="key.lastUsedAt">Last used: {{ formatDate(key.lastUsedAt) }}</span>
            <span v-if="key.revokedAt" class="text-rose-400">Revoked</span>
          </div>
        </div>
        <p v-if="!keys.length && !keysPending" class="text-xs text-muted-foreground">No keys yet.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { navigateTo, useUserSession } from '#imports'
import type { ApiKeyRecord, ApiKeyListResponse, CreateKeyResponse } from '~~/shared/types/api'

definePageMeta({ middleware: 'admin' })

const session = useUserSession()

onMounted(() => {
  refreshKeys()
})

const { data: keysData, refresh: refreshKeys, pending: keysPending, error: keysError } = useFetch<ApiKeyListResponse>(
  '/api/v1/keys',
  { immediate: false, server: false },
)

const keys = computed<ApiKeyRecord[]>(() => keysData.value?.items ?? [])

const form = reactive({
  name: '',
  limitPerDay: '',
})

const creating = ref(false)
const createdKey = ref('')
const createError = ref('')

async function createKey() {
  createError.value = ''
  createdKey.value = ''

  if (!form.name.trim()) {
    createError.value = 'Key name is required.'
    return
  }

  creating.value = true

  try {
    const payload: Record<string, string | number> = { name: form.name.trim() }
    if (form.limitPerDay.trim()) payload.limitPerDay = Number(form.limitPerDay)

    const response = await $fetch<CreateKeyResponse>('/api/v1/keys', {
      method: 'POST',
      body: payload,
    })

    createdKey.value = response.key
    form.name = ''
    form.limitPerDay = ''
    await refreshKeys()
  } catch (error) {
    createError.value = 'Failed to create key.'
  } finally {
    creating.value = false
  }
}

async function revokeKey(id: string) {
  await $fetch(`/api/v1/keys/${id}`, {
    method: 'DELETE',
  })
  await refreshKeys()
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await session.clear()
  await navigateTo('/login')
}

function formatDate(value?: number | null) {
  if (!value) return ''
  return new Date(value).toLocaleString()
}
</script>
