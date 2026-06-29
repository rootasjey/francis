<template>
  <section class="space-y-12 border-x max-w-4xl mx-auto py-12 px-6">
    <!-- Header -->
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold font-mono tracking-wide"
          :class="overallClass"
        >
          <span class="h-2 w-2 rounded-full" :class="overallDotClass" />
          {{ overallLabel }}
        </span>
        <span class="font-mono text-xs text-muted-foreground/50">
          v{{ data?.version }}
        </span>
      </div>
      <h1 class="font-sans text-4xl font-bold tracking-tight md:text-5xl">
        API Status
      </h1>
      <p class="max-w-lg text-sm leading-relaxed text-muted-foreground">
        Real-time health checks for the Francis API and its dependencies.
      </p>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading && !data" class="rounded-2 border border-border dark:border-gray-800 overflow-hidden">
      <div class="divide-y divide-border">
        <div v-for="n in 5" :key="n" class="flex items-center gap-4 px-6 py-5">
          <div class="h-2 w-2 rounded-full bg-muted-foreground/10" />
          <div class="h-4 w-20 rounded bg-muted-foreground/10" />
          <div class="ml-auto h-3 w-16 rounded bg-muted-foreground/5" />
        </div>
      </div>
    </div>

    <!-- Status panel -->
    <div v-else-if="data" class="rounded-2 border border-border dark:border-gray-800 bg-muted/30 overflow-hidden">
      <!-- Panel header -->
      <div class="flex items-center justify-between border-b border-border dark:border-gray-800 px-6 py-3.5">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg" :class="overallBgClass">
            <span :class="overallIcon" class="text-sm" />
          </div>
          <div>
            <p class="text-sm font-semibold">All Systems {{ overallAdverb }}</p>
            <p class="font-mono text-[11px] text-muted-foreground/60">Checked {{ relativeTime }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-mono text-[10px] text-muted-foreground/30">{{ data.service }} v{{ data.version }}</span>
          <button
            class="rounded-lg border border-border
              dark:border-gray-800 bg-background px-3 py-1.5
              font-mono text-[11px] text-muted-foreground transition-all duration-200
              hover:bg-muted dark:hover:bg-gray-800 hover:scale-105 active:scale-99 disabled:opacity-50"
            :disabled="loading"
            @click="handleRefresh"
          >
            <span class="i-lucide-refresh-cw mr-1 text-[10px]" :class="{ 'animate-spin': loading }" />
            refresh
          </button>
        </div>
      </div>

      <!-- Service rows -->
      <div class="divide-y divide-border dark:divide-gray-800">
        <div
          v-for="(check, name) in data.checks"
          :key="name"
          class="status-row relative flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors duration-200 hover:bg-muted/50"
          :class="`border-l-2 ${statusBorderClass(check.status)}`"
        >
          <div class="flex items-center gap-4 min-w-0">
            <span class="status-dot h-2 w-2 shrink-0 rounded-full" :class="statusDotClass(check.status)" />
            <div class="min-w-0">
              <p class="font-medium text-sm capitalize leading-tight">{{ name }}</p>
              <p v-if="check.message" class="truncate font-mono text-[11px] text-muted-foreground/60 leading-tight mt-0.5">{{ check.message }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4 shrink-0">
            <span v-if="check.latency !== undefined" class="font-mono text-xs text-muted-foreground/50">
              {{ check.latency }}ms
            </span>
            <span
              class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide"
              :class="statusLabelClass(check.status)"
            >
              {{ check.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="rounded-2 border border-red-400/20 bg-red-400/5 p-8 text-center">
      <span class="i-lucide-alert-triangle mx-auto text-2xl text-red-400" />
      <p class="mt-3 text-sm font-medium text-foreground">Failed to fetch status</p>
      <p class="mt-1 text-xs text-muted-foreground">{{ error }}</p>
      <button
        class="mt-4 rounded-lg border border-border dark:border-gray-800 bg-muted px-4 py-2 font-meta text-xs text-muted-foreground transition-all duration-200 hover:bg-muted-foreground/10"
        @click="handleRefresh"
      >
        Try again
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

interface StatusCheck {
  status: 'ok' | 'degraded' | 'down'
  latency?: number
  message?: string
}

interface StatusResponse {
  ok: boolean
  status: 'ok' | 'degraded' | 'down'
  service: string
  version: string
  timestamp: number
  checks: Record<string, StatusCheck>
}

const { data, refresh, pending: loading, error } = useLazyFetch<StatusResponse>('/api/status', {
  server: false,
})

const overallStatus = computed(() => data.value?.status ?? 'ok')

const overallLabel = computed(() => {
  switch (overallStatus.value) {
    case 'ok': return 'All systems operational'
    case 'degraded': return 'Degraded performance'
    case 'down': return 'Service disruption'
    default: return 'Unknown'
  }
})

const overallAdverb = computed(() => {
  switch (overallStatus.value) {
    case 'ok': return 'Operational'
    case 'degraded': return 'Degraded'
    case 'down': return 'Down'
    default: return 'Unknown'
  }
})

const overallClass = computed(() => {
  switch (overallStatus.value) {
    case 'ok': return 'bg-emerald-400/10 text-emerald-500 border border-emerald-400/20'
    case 'degraded': return 'bg-amber-400/10 text-amber-500 border border-amber-400/20'
    case 'down': return 'bg-red-400/10 text-red-400 border border-red-400/20'
    default: return 'bg-muted text-muted-foreground border border-border dark:border-gray-800'
  }
})

const overallDotClass = computed(() => {
  switch (overallStatus.value) {
    case 'ok': return 'bg-emerald-500'
    case 'degraded': return 'bg-amber-500'
    case 'down': return 'bg-red-400'
    default: return 'bg-muted-foreground'
  }
})

const overallBgClass = computed(() => {
  switch (overallStatus.value) {
    case 'ok': return 'bg-emerald-400/10'
    case 'degraded': return 'bg-amber-400/10'
    case 'down': return 'bg-red-400/10'
    default: return 'bg-muted'
  }
})

const overallIcon = computed(() => {
  switch (overallStatus.value) {
    case 'ok': return 'i-lucide-check-circle text-emerald-500'
    case 'degraded': return 'i-lucide-alert-triangle text-amber-500'
    case 'down': return 'i-lucide-x-circle text-red-400'
    default: return 'i-lucide-help-circle'
  }
})

function statusBorderClass(status: string) {
  switch (status) {
    case 'ok': return 'border-l-emerald-500/40'
    case 'degraded': return 'border-l-amber-500/40'
    case 'down': return 'border-l-red-400/40'
    default: return 'border-l-border'
  }
}

function statusDotClass(status: string) {
  switch (status) {
    case 'ok': return 'bg-emerald-500'
    case 'degraded': return 'bg-amber-500'
    case 'down': return 'bg-red-400'
    default: return 'bg-muted-foreground'
  }
}

function statusLabelClass(status: string) {
  switch (status) {
    case 'ok': return 'bg-emerald-400/10 text-emerald-500'
    case 'degraded': return 'bg-amber-400/10 text-amber-500'
    case 'down': return 'bg-red-400/10 text-red-400'
    default: return 'bg-muted text-muted-foreground'
  }
}

const relativeTime = computed(() => {
  if (!data.value?.timestamp) return ''
  const diff = Date.now() - data.value.timestamp
  if (diff < 1000) return 'just now'
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
})

function handleRefresh() {
  refresh()
}

onMounted(() => {
  refresh()
})
</script>

<style scoped>
.status-row {
  border-left-width: 2px;
}
</style>
