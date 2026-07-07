<template>
  <section class="border-x dark:border-gray-800 max-w-6xl mx-auto py-12 px-6 space-y-12">
    <!-- Header -->
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <span class="i-lucide-layout-dashboard text-sm text-primary" />
        </div>
        <div>
          <h1 class="font-sans text-3xl font-bold tracking-tight">Dashboard</h1>
          <p class="font-mono text-xs text-muted-foreground/60">Monitor usage, keys, and daily limits.</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 rounded-xl border border-border dark:border-gray-800 bg-muted/30 p-1 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
        :class="activeTab === tab.id
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Account tab -->
    <template v-if="activeTab === 'account'">
      <!-- Signed in -->
      <div class="rounded-2 border border-border dark:border-gray-800 bg-muted/30 overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-background">
              <span class="i-lucide-user text-xs text-muted-foreground" />
            </div>
            <div>
              <p class="text-sm font-medium">Signed in</p>
              <p class="font-mono text-xs text-muted-foreground/60">{{ session.user.value?.email }}</p>
            </div>
          </div>
          <button
            class="rounded-lg border border-border dark:border-gray-800 bg-background px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-all duration-200 hover:bg-muted"
            @click="logout"
          >
            Sign out
          </button>
        </div>
      </div>

      <!-- Subscription -->
      <div class="rounded-2 border border-border dark:border-gray-800 bg-card overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-background">
              <span class="i-lucide-credit-card text-xs text-muted-foreground" />
            </div>
            <div>
              <p class="text-sm font-medium">Subscription</p>
              <p class="font-mono text-xs text-muted-foreground/60">Plan, usage, and billing</p>
            </div>
          </div>
          <div v-if="subPending" class="h-6 w-24 animate-pulse rounded bg-muted-foreground/10" />
          <span
            v-else-if="subData?.tier"
            class="rounded-full px-3 py-1 font-mono text-[10px] font-semibold tracking-wider uppercase"
            :class="subData.status === 'active'
              ? 'bg-emerald-400/10 text-emerald-400'
              : subData.status === 'canceled'
                ? 'bg-amber-400/10 text-amber-400'
                : 'bg-muted text-muted-foreground'"
          >
            {{ subData.tier }}
          </span>
          <span
            v-else
            class="rounded-full px-3 py-1 font-mono text-[10px] font-semibold tracking-wider uppercase bg-muted text-muted-foreground"
          >
            Free
          </span>
        </div>
        <div class="border-t border-border dark:border-gray-800 px-6 py-4">
          <div v-if="subPending" class="flex items-center gap-2 text-xs text-muted-foreground">
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/30" />
            Loading
          </div>
          <template v-else-if="subData?.tier && subData?.status === 'active'">
            <p class="text-sm">
              You're on the <strong class="capitalize">{{ subData.tier }}</strong> plan.
            </p>
            <p v-if="subData.endsAt" class="mt-1 font-mono text-xs text-muted-foreground">
              Renews {{ formatDate(subData.endsAt) }}
            </p>
            <div class="mt-4 flex gap-3">
              <a
                href="/api/polar/portal"
                class="rounded-lg border border-border bg-background px-4 py-2 font-mono text-xs text-foreground transition-colors duration-200 hover:bg-muted"
              >
                Manage
              </a>
            </div>
          </template>
          <template v-else-if="subData?.tier && subData?.status === 'canceled'">
            <p class="text-sm text-muted-foreground">
              Your <strong class="capitalize text-foreground">{{ subData.tier }}</strong> plan is canceled.
            </p>
            <p v-if="subData.endsAt" class="mt-1 font-mono text-xs text-muted-foreground">
              Access until {{ formatDate(subData.endsAt) }}
            </p>
            <div class="mt-4 flex gap-3">
              <a
                href="/api/polar/portal"
                class="rounded-lg border border-border bg-background px-4 py-2 font-mono text-xs text-foreground transition-colors duration-200 hover:bg-muted"
              >
                Reactivate
              </a>
            </div>
          </template>
          <template v-else>
            <p class="text-sm text-muted-foreground">
              You're on the <strong class="text-foreground">Free</strong> plan.
            </p>
            <p class="mt-1 font-mono text-xs text-muted-foreground">
              Upgrade to unlock higher rate limits and more features.
            </p>
            <div class="mt-4 flex gap-3">
              <NuxtLink
                to="/pricing"
                class="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background transition-all duration-200 hover:brightness-110"
              >
                Upgrade
              </NuxtLink>
            </div>
          </template>
        </div>
      </div>
    </template>

    <!-- Analytics tab -->
    <template v-if="activeTab === 'analytics'">
      <!-- Stats -->
      <div class="grid gap-4 lg:grid-cols-4">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          class="rounded-2 border border-border dark:border-gray-800 bg-card p-5 transition-all duration-200 hover:border-primary/20"
          :style="{ animationDelay: `${i * 80}ms` }"
        >
          <p class="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground/60 uppercase">{{ stat.label }}</p>
          <p class="mt-2 font-sans text-3xl font-bold tracking-tight" :class="stat.valueClass">{{ stat.value }}</p>
          <div class="mt-3 flex items-center gap-2">
            <span :class="stat.trendIcon" class="text-xs" />
            <span class="font-mono text-xs text-muted-foreground/60">{{ stat.trend }}</span>
          </div>
        </div>
      </div>

      <!-- Chart + Key selector -->
      <div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <!-- Chart -->
        <div class="rounded-2 border border-border dark:border-gray-800 bg-card overflow-hidden">
          <div class="flex items-center justify-between border-b border-border dark:border-gray-800 px-6 py-3.5">
            <div>
              <h2 class="text-sm font-semibold">Requests over time</h2>
              <p class="font-mono text-[11px] text-muted-foreground/60">Rolling 30-day volume</p>
            </div>
            <div class="flex items-center gap-2 font-mono text-[11px] text-muted-foreground/60">
              <span class="h-2 w-2 rounded-full bg-primary" />
              API
            </div>
          </div>
          <div class="p-6">
            <div class="rounded-xl border border-border bg-gradient-to-b from-muted via-transparent to-transparent p-4">
              <div v-if="loadingUsage" class="flex h-40 items-center justify-center">
                <div class="flex items-center gap-2 text-xs text-muted-foreground">
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/30" />
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/30" style="animation-delay: 200ms" />
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/30" style="animation-delay: 400ms" />
                  Loading
                </div>
              </div>
              <svg
                v-else-if="chartPath"
                ref="chartSvg"
                viewBox="0 0 100 40"
                class="h-40 w-full"
              >
                <path :d="chartPath" fill="none" stroke="#3C82F6" stroke-width="2" class="chart-line" />
              </svg>
              <div v-else class="flex h-40 flex-col items-center justify-center gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted">
                  <span class="i-lucide-bar-chart-3 text-lg text-muted-foreground/50" />
                </div>
                <div class="text-center">
                  <p class="text-sm font-medium text-foreground">No usage data yet</p>
                  <p class="mt-1 max-w-xs text-xs text-muted-foreground">Select a key below to see request volume over the last 30 days.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Key selector -->
        <div class="rounded-2 border border-border dark:border-gray-800 bg-card overflow-hidden">
          <div class="flex items-center justify-between border-b border-border dark:border-gray-800 px-6 py-3.5">
            <h2 class="text-sm font-semibold">Key selector</h2>
            <button
              class="flex items-center gap-1.5 rounded-lg border border-border dark:border-gray-800 bg-background px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-all duration-200 hover:bg-muted"
              :disabled="keysPending"
              @click="() => refreshKeys()"
            >
              <span class="i-lucide-refresh-cw text-xs" :class="{ 'animate-spin': keysPending }" />
              Refresh
            </button>
          </div>
          <div class="p-6">
            <label class="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground/60 uppercase">Usage source</label>
            <select
              v-model="selectedKeyId"
              class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground transition-all duration-200 focus:border-primary/30 focus:outline-none"
            >
              <option value="" class="font-mono">Select a key</option>
              <option v-for="key in keys" :key="key.id" :value="key.id" class="font-mono">
                {{ key.name }} ({{ key.prefix }}&bullet;&bullet;&bullet;&bullet;)
              </option>
            </select>

            <div v-if="keysPending" class="mt-4 space-y-3">
              <div v-for="n in 2" :key="n" class="animate-pulse rounded-xl border border-border bg-muted p-4">
                <div class="h-4 w-24 rounded bg-muted-foreground/10" />
                <div class="mt-2 h-3 w-32 rounded bg-muted-foreground/10" />
              </div>
            </div>

            <TransitionGroup v-else name="key-list" tag="div" class="mt-4 space-y-3">
              <div
                v-for="key in keys"
                :key="key.id"
                class="rounded-xl border border-border bg-muted p-4 transition-all duration-200 hover:border-primary/20"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <p class="text-sm font-medium">{{ key.name }}</p>
                    <p class="mt-0.5 font-mono text-xs text-muted-foreground">{{ key.prefix }}&bullet;&bullet;&bullet;&bullet;</p>
                  </div>
                  <span
                    class="rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase"
                    :class="key.revokedAt ? 'bg-rose-400/10 text-rose-400' : 'bg-emerald-400/10 text-emerald-400'"
                  >
                    {{ key.revokedAt ? 'Revoked' : 'Active' }}
                  </span>
                </div>
              </div>
            </TransitionGroup>

            <div v-if="!keys.length && !keysPending" class="mt-8 flex flex-col items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted">
                <span class="i-lucide-key-round text-lg text-muted-foreground/50" />
              </div>
              <div class="text-center">
                <p class="text-sm font-medium text-foreground">No API keys</p>
                <p class="mt-1 text-xs text-muted-foreground">Go to the Admin panel to create your first key.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Keys tab -->
    <template v-if="activeTab === 'keys'">
      <div class="rounded-2 border border-border dark:border-gray-800 bg-card overflow-hidden">
        <div class="flex items-center justify-between border-b border-border dark:border-gray-800 px-6 py-3.5">
          <h2 class="text-sm font-semibold">API Keys</h2>
          <button
            class="flex items-center gap-1.5 rounded-lg border border-border dark:border-gray-800 bg-background px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-all duration-200 hover:bg-muted"
            :disabled="keysPending"
            @click="() => refreshKeys()"
          >
            <span class="i-lucide-refresh-cw text-xs" :class="{ 'animate-spin': keysPending }" />
            Refresh
          </button>
        </div>
        <div class="p-6">
          <div v-if="keysPending" class="space-y-3">
            <div v-for="n in 2" :key="n" class="animate-pulse rounded-xl border border-border bg-muted p-4">
              <div class="h-4 w-24 rounded bg-muted-foreground/10" />
              <div class="mt-2 h-3 w-32 rounded bg-muted-foreground/10" />
            </div>
          </div>

          <TransitionGroup v-else name="key-list" tag="div" class="space-y-3">
            <div
              v-for="key in keys"
              :key="key.id"
              class="rounded-xl border border-border bg-muted p-4 transition-all duration-200 hover:border-primary/20"
            >
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-sm font-medium">{{ key.name }}</p>
                  <p class="mt-0.5 font-mono text-xs text-muted-foreground">{{ key.prefix }}&bullet;&bullet;&bullet;&bullet;</p>
                </div>
                <span
                  class="rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase"
                  :class="key.revokedAt ? 'bg-rose-400/10 text-rose-400' : 'bg-emerald-400/10 text-emerald-400'"
                >
                  {{ key.revokedAt ? 'Revoked' : 'Active' }}
                </span>
              </div>
            </div>
          </TransitionGroup>

          <div v-if="!keys.length && !keysPending" class="mt-8 flex flex-col items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted">
              <span class="i-lucide-key-round text-lg text-muted-foreground/50" />
            </div>
            <div class="text-center">
              <p class="text-sm font-medium text-foreground">No API keys</p>
              <p class="mt-1 text-xs text-muted-foreground">Go to the Admin panel to create your first key.</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { navigateTo, useUserSession } from '#imports'
import type { ApiKeyListResponse, UsageResponse } from '~~/shared/types/api'

type SubscriptionResponse = {
  tier: string | null
  status: string | null
  endsAt: number | null
  customerId: string | null
}

definePageMeta({ middleware: 'auth', pageTransition: { name: 'page', mode: 'out-in' } })

const session = useUserSession()

const tabs = [
  { id: 'account', label: 'Account' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'keys', label: 'Keys' },
]
const activeTab = ref('account')
const chartSvg = ref<SVGSVGElement | null>(null)

const { data: subData, pending: subPending } = useFetch<SubscriptionResponse>(
  '/api/polar/subscription',
  { server: false },
)

// --- data fetching ---

const { data: keysData, refresh: refreshKeys, pending: keysPending } = useFetch<ApiKeyListResponse>(
  '/api/v1/keys',
  { immediate: false, server: false },
)

const keys = computed(() => keysData.value?.items ?? [])

const selectedKeyId = ref('')

const { data: usageData, refresh: refreshUsage, pending: loadingUsage } = useFetch<UsageResponse>(
  () => `/api/v1/usage?apiKeyId=${selectedKeyId.value}`,
  { immediate: false, server: false },
)

const usageItems = computed(() => usageData.value?.items ?? [])

// --- stats ---

const totalRequests = computed(() => usageItems.value.reduce((sum, item) => sum + item.requests, 0))
const activeKeys = computed(() => keys.value.filter((key) => !key.revokedAt).length)
const dailyCap = computed(() => {
  const selected = keys.value.find((key) => key.id === selectedKeyId.value)
  return selected?.limitPerDay ?? null
})

const stats = computed(() => [
  {
    label: 'Total requests',
    value: totalRequests.value.toLocaleString(),
    valueClass: totalRequests.value > 0 ? 'text-foreground' : 'text-muted-foreground/60',
    trendIcon: totalRequests.value > 0 ? 'i-lucide-trending-up text-emerald-400' : 'i-lucide-minus text-muted-foreground/40',
    trend: totalRequests.value > 0 ? 'Active' : 'No activity yet',
  },
  {
    label: 'Active API keys',
    value: String(activeKeys.value),
    valueClass: activeKeys.value > 0 ? 'text-foreground' : 'text-muted-foreground/60',
    trendIcon: activeKeys.value > 0 ? 'i-lucide-check-circle text-emerald-400' : 'i-lucide-circle text-muted-foreground/40',
    trend: activeKeys.value > 0 ? `${activeKeys.value} key${activeKeys.value === 1 ? '' : 's'}` : 'No keys',
  },
  {
    label: 'Daily cap',
    value: dailyCap.value !== null ? dailyCap.value.toLocaleString() : '--',
    valueClass: dailyCap.value !== null ? 'text-foreground' : 'text-muted-foreground/60',
    trendIcon: dailyCap.value !== null ? 'i-lucide-gauge text-primary' : 'i-lucide-help-circle text-muted-foreground/40',
    trend: dailyCap.value !== null ? 'Per selected key' : 'Select a key',
  },
  {
    label: 'Latency p95',
    value: '32ms',
    valueClass: 'text-foreground',
    trendIcon: 'i-lucide-zap text-amber-400',
    trend: 'Edge average',
  },
])

// --- chart ---

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

// Animate chart stroke on mount
function animateChart() {
  if (!chartSvg.value) return
  const path = chartSvg.value.querySelector('.chart-line') as SVGPathElement | null
  if (!path) return
  const length = path.getTotalLength()
  path.style.strokeDasharray = String(length)
  path.style.strokeDashoffset = String(length)
  path.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)'
  requestAnimationFrame(() => {
    path.style.strokeDashoffset = '0'
  })
}

watch(chartPath, async () => {
  if (chartPath.value) {
    await nextTick()
    animateChart()
  }
})

// --- lifecycle ---

onMounted(() => {
  refreshKeys()
})

watch(selectedKeyId, (value) => {
  if (value) refreshUsage()
})

// --- actions ---

function formatDate(value: number | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await session.clear()
  await navigateTo('/login')
}
</script>

<style scoped>
.chart-line {
  transition: stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.key-list-enter-active,
.key-list-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.key-list-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
.key-list-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
