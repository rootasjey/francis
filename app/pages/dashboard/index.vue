<template>
  <section class="space-y-10">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-title text-3xl tracking-tight">Dashboard</h1>
        <p class="mt-1 font-meta text-xs tracking-wider text-muted-foreground uppercase">Monitor usage, keys, and daily limits.</p>
      </div>
      <div class="flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-4 py-2 font-meta text-xs text-accent">
        <span class="i-lucide-calendar text-xs" />
        Last 30 days
      </div>
    </div>

    <div class="rounded-2xl border border-border bg-card p-5">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted">
            <span class="i-lucide-user text-sm text-muted-foreground" />
          </div>
          <div>
            <p class="font-medium text-sm">Signed in</p>
            <p class="font-mono text-xs text-muted-foreground">{{ session.user.value?.email }}</p>
          </div>
        </div>
        <button
          class="rounded-lg border border-border bg-muted px-4 py-2 font-meta text-xs font-semibold text-foreground transition-all duration-200 hover:bg-accent"
          @click="logout"
        >
          Sign out
        </button>
      </div>
    </div>

    <!-- Stats with context -->
    <div class="grid gap-4 lg:grid-cols-4">
      <div
        v-for="(stat, i) in stats"
        :key="stat.label"
        class="group rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/20"
        :style="{ animationDelay: `${i * 80}ms` }"
      >
        <p class="font-meta text-xs tracking-wider text-muted-foreground uppercase">{{ stat.label }}</p>
        <p class="mt-2 font-title text-3xl tracking-tight" :class="stat.valueClass">{{ stat.value }}</p>
        <div class="mt-3 flex items-center gap-2">
          <span :class="stat.trendIcon" class="text-xs" />
          <span class="font-meta text-xs text-muted-foreground">{{ stat.trend }}</span>
        </div>
      </div>
    </div>

    <!-- Chart + Keys -->
    <div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div class="rounded-2xl border border-border bg-card p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-title text-lg tracking-tight">Requests over time</h2>
            <p class="font-meta text-xs tracking-wider text-muted-foreground uppercase">Rolling 30-day volume</p>
          </div>
          <div class="flex items-center gap-2 font-meta text-xs text-muted-foreground">
            <span class="h-2 w-2 rounded-full bg-primary" />
            API
          </div>
        </div>
        <div class="mt-6 rounded-xl border border-border bg-gradient-to-b from-muted via-transparent to-transparent p-4">
          <!-- Loading skeleton -->
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
              <p class="mt-1 max-w-xs text-xs text-muted-foreground">Select a key from the Keys panel to see request volume over the last 30 days.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-card p-6">
        <div class="flex items-center justify-between">
          <h2 class="font-title text-lg tracking-tight">Keys</h2>
          <button
            class="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 font-meta text-xs text-muted-foreground transition-all duration-200 hover:bg-accent"
            :disabled="keysPending"
            @click="() => refreshKeys()"
          >
            <span class="i-lucide-refresh-cw text-xs" :class="{ 'animate-spin': keysPending }" />
            Refresh
          </button>
        </div>
        <div class="mt-4">
          <label class="font-meta text-xs tracking-wider text-muted-foreground uppercase">Usage source</label>
          <select
            v-model="selectedKeyId"
            class="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-sm text-foreground transition-all duration-200 focus:border-primary/30 focus:outline-none"
          >
            <option value="" class="font-meta">Select a key</option>
            <option v-for="key in keys" :key="key.id" :value="key.id" class="font-mono">
              {{ key.name }} ({{ key.prefix }}&bullet;&bullet;&bullet;&bullet;)
            </option>
          </select>
        </div>

        <!-- Loading skeleton for keys -->
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
                class="rounded-full px-2 py-0.5 font-meta text-[10px] tracking-wider uppercase"
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
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { navigateTo, useUserSession } from '#imports'
import type { ApiKeyListResponse, UsageResponse } from '~~/shared/types/api'

definePageMeta({ middleware: 'auth', pageTransition: { name: 'page', mode: 'out-in' } })

const session = useUserSession()
const chartSvg = ref<SVGSVGElement | null>(null)

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
