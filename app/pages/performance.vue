<template>
  <section class="space-y-12 border-x dark:border-gray-800 max-w-5xl mx-auto py-12">
    <div class="px-6 md:px-12 space-y-4 mt-16">
      <div class="flex items-center gap-3">
        <h1 class="font-sans text-4xl md:text-6xl font-bold tracking-tight">
          Workers Performance
        </h1>
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <span class="i-lucide-zap text-sm text-primary" />
        </div>
      </div>
      <p class="max-w-2xl text-base leading-relaxed text-muted-foreground">
        Francis runs entirely on <span class="text-foreground font-semibold">Cloudflare Workers</span> —
        serverless functions deployed at the edge for sub-millisecond cold starts and
        global low-latency access.
      </p>
    </div>

    <!-- Key metrics -->
    <div class="px-6 md:px-12">
      <div class="grid gap-4 md:grid-cols-3">
        <div
          v-for="(metric, i) in metrics"
          :key="metric.label"
          class="rounded-2 border border-border dark:border-gray-800 bg-gray-100 dark:bg-gray-950 p-6 transition-all duration-200 hover:border-primary/20"
          :style="{ animationDelay: `${i * 80}ms` }"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-xl" :class="metric.bgClass">
            <span :class="metric.icon" class="text-lg" />
          </div>
          <p class="mt-4 font-mono text-3xl font-bold tracking-tight" :class="metric.valueClass">{{ metric.value }}</p>
          <p class="mt-1 text-sm text-muted-foreground">{{ metric.label }}</p>
        </div>
      </div>
    </div>

    <!-- Architecture -->
    <div class="px-6 md:px-12 space-y-4">
      <h2 class="text-2xl font-bold tracking-tight">How it works</h2>
      <div class="rounded-2 border border-border dark:border-gray-800 overflow-hidden">
        <div class="divide-y divide-border dark:divide-gray-800">
          <div v-for="(step, i) in architecture" :key="i" class="flex gap-4 px-6 py-5">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <span class="font-mono text-xs font-bold text-primary">{{ i + 1 }}</span>
            </div>
            <div>
              <p class="text-sm font-semibold">{{ step.title }}</p>
              <p class="mt-0.5 text-xs text-muted-foreground">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tech stack -->
    <div class="px-6 md:px-12 space-y-4">
      <h2 class="text-2xl font-bold tracking-tight">Stack</h2>
      <div class="grid gap-3 md:grid-cols-2">
        <div v-for="item in stack" :key="item.name" class="rounded-2 border border-border dark:border-gray-900 bg-gray-100 dark:bg-transparent p-5 flex items-center gap-4">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" :class="item.bgClass">
            <span :class="item.icon" class="text-base" />
          </div>
          <div>
            <p class="text-sm font-semibold">{{ item.name }}</p>
            <p class="text-xs text-muted-foreground">{{ item.role }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Real-time status link -->
    <div class="px-6 md:px-12 border-t border-border dark:border-gray-800 pt-8">
      <div class="rounded-2 border border-border dark:border-gray-800 bg-muted/30 p-6 flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold">Live system status</p>
          <p class="text-xs text-muted-foreground mt-0.5">Real-time health checks for all services</p>
        </div>
        <NuxtLink
          to="/status"
          class="rounded-lg bg-foreground px-5 py-2 text-sm font-semibold text-background transition-all duration-200 hover:brightness-110"
        >
          View Status
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Metric {
  label: string
  value: string
  icon: string
  bgClass: string
  valueClass: string
}

const metrics: Metric[] = [
  {
    label: 'Average response time',
    value: '< 50ms',
    icon: 'i-lucide-clock',
    bgClass: 'bg-emerald-400/10',
    valueClass: 'text-emerald-400',
  },
  {
    label: 'Cold start',
    value: '< 5ms',
    icon: 'i-lucide-flame',
    bgClass: 'bg-amber-400/10',
    valueClass: 'text-amber-400',
  },
  {
    label: 'Uptime SLA',
    value: '99.99%',
    icon: 'i-lucide-shield-check',
    bgClass: 'bg-primary/10',
    valueClass: 'text-primary',
  },
]

const architecture = [
  {
    title: 'Request arrives at the edge',
    description: 'HTTP requests are handled by Cloudflare Workers in one of 330+ global data centers, nearest to the user.',
  },
  {
    title: 'Authentication & rate limiting',
    description: 'API keys are validated via SHA-256 hashed lookup in D1. Daily usage quotas are checked and incremented atomically.',
  },
  {
    title: 'Language detection',
    description: 'franc-all runs as a pure JS/WASM module inside the Worker — no external API calls, no cold-start latency for inference.',
  },
  {
    title: 'Translation (optional)',
    description: 'For translation requests, the Worker calls OpenRouter with automatic model fallback and in-memory caching.',
  },
  {
    title: 'Response returned',
    description: 'JSON response is streamed back from the edge, typically under 50ms for detection and under 2s for translation.',
  },
]

interface StackItem {
  name: string
  role: string
  icon: string
  bgClass: string
}

const stack: StackItem[] = [
  { name: 'Cloudflare Workers', role: 'Serverless execution environment', icon: 'i-lucide-cloud', bgClass: 'bg-orange-400/10' },
  { name: 'Cloudflare D1', role: 'SQLite database (users, keys, usage)', icon: 'i-lucide-database', bgClass: 'bg-blue-400/10' },
  { name: 'Cloudflare KV', role: 'Key-value store for config', icon: 'i-lucide-key-round', bgClass: 'bg-purple-400/10' },
  { name: 'franc-all', role: 'Trigram-based language detection (WASM)', icon: 'i-lucide-search-code', bgClass: 'bg-emerald-400/10' },
  { name: 'OpenRouter', role: 'Multi-model AI translation API', icon: 'i-lucide-git-branch', bgClass: 'bg-rose-400/10' },
  { name: 'Drizzle ORM', role: 'Database migrations and queries', icon: 'i-lucide-file-json', bgClass: 'bg-amber-400/10' },
  { name: 'Nuxt', role: 'Full-stack framework (Vue + Nitro)', icon: 'i-lucide-globe', bgClass: 'bg-green-400/10' },
  { name: 'UnoCSS', role: 'Utility-first CSS engine', icon: 'i-lucide-palette', bgClass: 'bg-sky-400/10' },
]
</script>
