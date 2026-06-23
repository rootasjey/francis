<template>
  <section class="space-y-10">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold">Dashboard</h1>
        <p class="text-sm text-muted-foreground">Monitor usage, keys, and daily limits.</p>
      </div>
      <div class="flex items-center gap-3 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-muted-foreground">
        <span class="i-lucide-calendar" />
        Last 30 days
      </div>
    </div>

    <div class="rounded-2xl border border-border bg-card p-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold">Signed in</h2>
          <p class="text-xs text-muted-foreground">{{ session.user.value?.email }}</p>
        </div>
        <button
          class="rounded-lg border border-border bg-muted px-4 py-2 text-xs font-semibold text-foreground"
          @click="logout"
        >
          Sign out
        </button>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-4">
      <div class="rounded-2xl border border-border bg-card p-5">
        <p class="text-xs text-muted-foreground">Total requests</p>
        <p class="mt-2 text-2xl font-semibold">{{ totalRequests.toLocaleString() }}</p>
        <p class="mt-3 text-xs text-muted-foreground">Last 30 days</p>
      </div>
      <div class="rounded-2xl border border-border bg-card p-5">
        <p class="text-xs text-muted-foreground">Active API keys</p>
        <p class="mt-2 text-2xl font-semibold">{{ activeKeys }}</p>
        <p class="mt-3 text-xs text-muted-foreground">Loaded from admin API</p>
      </div>
      <div class="rounded-2xl border border-border bg-card p-5">
        <p class="text-xs text-muted-foreground">Daily cap</p>
        <p class="mt-2 text-2xl font-semibold">{{ dailyCap.toLocaleString() }}</p>
        <p class="mt-3 text-xs text-muted-foreground">Selected key limit</p>
      </div>
      <div class="rounded-2xl border border-border bg-card p-5">
        <p class="text-xs text-muted-foreground">Latency p95</p>
        <p class="mt-2 text-2xl font-semibold">32ms</p>
        <p class="mt-3 text-xs text-muted-foreground">Edge average</p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div class="rounded-2xl border border-border bg-card p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold">Requests over time</h2>
            <p class="text-xs text-muted-foreground">Rolling 30-day volume</p>
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <span class="h-2 w-2 rounded-full bg-blue-400" />
            API
          </div>
        </div>
        <div class="mt-6 rounded-xl border border-border bg-gradient-to-b from-muted via-transparent to-transparent p-4">
          <svg v-if="chartPath" viewBox="0 0 100 40" class="h-40 w-full">
            <path :d="chartPath" fill="none" stroke="#60a5fa" stroke-width="2" />
          </svg>
          <div v-else class="flex h-40 items-center justify-center text-xs text-muted-foreground">
            No usage data yet.
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-card p-6">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Keys</h2>
          <button
            class="rounded-lg border border-border bg-muted px-3 py-1 text-xs text-muted-foreground"
            :disabled="keysPending"
            @click="refreshKeys"
          >
            Refresh
          </button>
        </div>
        <div class="mt-4">
          <label class="text-xs text-muted-foreground">Usage source</label>
          <select
            v-model="selectedKeyId"
            class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">Select a key</option>
            <option v-for="key in keys" :key="key.id" :value="key.id">
              {{ key.name }} ({{ key.prefix }}&bullet;&bullet;&bullet;&bullet;)
            </option>
          </select>
        </div>
        <div class="mt-4 space-y-3">
          <div
            v-for="key in keys"
            :key="key.id"
            class="rounded-xl border border-border bg-muted p-4"
          >
            <p class="text-sm font-medium">{{ key.name }}</p>
            <p class="mt-1 text-xs text-muted-foreground">{{ key.prefix }}&bullet;&bullet;&bullet;&bullet;</p>
            <p class="mt-3 text-xs" :class="key.revokedAt ? 'text-rose-400' : 'text-emerald-400'">
              {{ key.revokedAt ? 'Revoked' : 'Active' }}
            </p>
          </div>
          <p v-if="!keys.length && !keysPending" class="text-xs text-muted-foreground">No keys yet.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { navigateTo, useUserSession } from '#imports'
import type { ApiKeyListResponse, UsageResponse } from '~~/shared/types/api'

definePageMeta({ middleware: 'auth' })

const session = useUserSession()

const { data: keysData, refresh: refreshKeys, pending: keysPending } = useFetch<ApiKeyListResponse>(
  '/api/v1/keys',
  { immediate: false, server: false },
)

const keys = computed(() => keysData.value?.items ?? [])

const selectedKeyId = ref('')

const { data: usageData, refresh: refreshUsage } = useFetch<UsageResponse>(
  () => `/api/v1/usage?apiKeyId=${selectedKeyId.value}`,
  { immediate: false, server: false },
)

const usageItems = computed(() => usageData.value?.items ?? [])

const totalRequests = computed(() => usageItems.value.reduce((sum, item) => sum + item.requests, 0))
const activeKeys = computed(() => keys.value.filter((key) => !key.revokedAt).length)
const dailyCap = computed(() => {
  const selected = keys.value.find((key) => key.id === selectedKeyId.value)
  return selected?.limitPerDay ?? 0
})

const chartPath = computed(() => {
  const points = usageItems.value
  if (!points.length) return ''

  const values = points.map((item) => item.requests)
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1

  return points
    .map((item, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100
      const normalized = (item.requests - min) / range
      const y = 36 - normalized * 30
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
})

onMounted(() => {
  refreshKeys()
})

watch(selectedKeyId, (value) => {
  if (value) refreshUsage()
})

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await session.clear()
  await navigateTo('/login')
}
</script>
