<template>
  <section class="space-y-16">
    <div class="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div class="space-y-6">
        <div class="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-xs text-muted-foreground">
          <span class="h-2 w-2 rounded-full bg-emerald-400" />
          HTTP-first Franc-all API for Workers
        </div>
        <h1 class="text-4xl font-semibold leading-tight md:text-5xl">
          Detect language at scale with a fast, privacy-friendly API.
        </h1>
        <p class="text-lg text-muted-foreground">
          Francis powers Verbatims with franc-all on Cloudflare Workers. Ship language detection in milliseconds
          with API keys, usage tracking, and a modern console.
        </p>
        <div class="flex flex-wrap gap-3">
          <NuxtLink
            to="/dashboard"
            class="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110"
          >
            Launch dashboard
          </NuxtLink>
          <a
            href="#api"
            class="rounded-lg border border-border bg-muted px-5 py-3 text-sm font-semibold text-foreground hover:bg-accent"
          >
            View API
          </a>
        </div>
        <div class="flex items-center gap-6 text-sm text-muted-foreground">
          <div class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-blue-400" />
            180+ languages
          </div>
          <div class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-purple-400" />
            Worker-native
          </div>
          <div class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-amber-400" />
            Usage caps ready
          </div>
        </div>
      </div>

      <div class="rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div class="rounded-2xl border border-border bg-muted p-6">
          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <span>POST /api/v1/detect</span>
            <span>200 OK</span>
          </div>
          <pre class="mt-4 rounded-lg bg-background/50 p-4 text-xs text-foreground">
{ "text": "Les sanglots longs des violons" }
          </pre>
          <div class="mt-4 grid gap-3 text-xs text-muted-foreground">
            <div class="flex items-center justify-between rounded-lg border border-border bg-background/30 px-3 py-2">
              <span>language</span>
              <span class="text-emerald-400">fra</span>
            </div>
            <div class="flex items-center justify-between rounded-lg border border-border bg-background/30 px-3 py-2">
              <span>confidence</span>
              <span>0.81</span>
            </div>
            <div class="flex items-center justify-between rounded-lg border border-border bg-background/30 px-3 py-2">
              <span>alternatives</span>
              <span>fra &bull; cat &bull; spa</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <div v-for="feature in features" :key="feature.title" class="rounded-2xl border border-border bg-card p-6">
        <h3 class="text-lg font-semibold">{{ feature.title }}</h3>
        <p class="mt-2 text-sm text-muted-foreground">{{ feature.description }}</p>
      </div>
    </div>

    <div id="api" class="space-y-6 rounded-3xl border border-border bg-card p-8">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold">API quickstart</h2>
        <span class="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">francis.verbatims.cc</span>
      </div>
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-3">
          <p class="text-sm text-muted-foreground">Headers</p>
          <pre class="rounded-xl bg-muted p-4 text-xs text-foreground">x-api-key: fcs_************************</pre>
        </div>
        <div class="space-y-3">
          <p class="text-sm text-muted-foreground">Request</p>
          <pre class="rounded-xl bg-muted p-4 text-xs text-foreground">POST /api/v1/detect
{ "text": "Hello from Verbatims" }</pre>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const features = [
  {
    title: 'Key management',
    description: 'Generate, revoke, and rotate API keys in one place. Built for multi-project usage.',
  },
  {
    title: 'Usage controls',
    description: 'Daily limits, usage summaries, and pricing-ready tables for future billing integrations.',
  },
  {
    title: 'Workers performance',
    description: 'HTTP-first endpoints optimized for Worker-to-Worker calls and edge latency.',
  },
]
</script>
