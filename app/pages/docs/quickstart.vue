<template>
  <section class="space-y-12 border-x dark:border-gray-800 max-w-4xl mx-auto py-12">
    <div class="px-6 md:px-12 space-y-4 mt-6">
      <div class="flex items-center gap-3">
        <h1 class="font-serif text-4xl md:text-6xl font-bold tracking-tight">
          Quickstart
        </h1>
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10">
          <span class="i-lucide-rocket text-sm text-emerald-400" />
        </div>
      </div>
      <p class="max-w-2xl text-base leading-relaxed text-muted-foreground">
        Get up and running with Francis in under a minute. Make your first language detection or translation request.
      </p>
    </div>

    <div class="px-6 md:px-12 space-y-4">
      <h2 class="text-2xl font-serif font-bold tracking-tight">1. Get an API key</h2>
      <p class="text-sm text-muted-foreground leading-relaxed">
        Sign up for a free account to receive an API key. Keys are prefixed with <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">fcs_</code> and are immediately ready to use.
      </p>
      <CodeBlock :code="createKeyCode" language="bash" label="Terminal" />
      <p class="text-xs text-muted-foreground/60 italic">
        Or sign in to the <NuxtLink to="/dashboard" class="text-accent hover:underline">dashboard</NuxtLink> to generate a key with one click.
      </p>
    </div>

    <div class="px-6 md:px-12 space-y-4">
      <h2 class="text-2xl font-serif font-bold tracking-tight">2. Detect a language</h2>
      <p class="text-sm text-muted-foreground leading-relaxed">
        Send a <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">POST</code> request to <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">/api/v1/detect</code> with your text and API key.
      </p>
      <CodeBlock :code="detectCode" language="bash" label="Terminal" />
    </div>

    <div class="px-6 md:px-12 space-y-4">
      <h2 class="text-2xl font-serif font-bold tracking-tight">3. Translate text</h2>
      <p class="text-sm text-muted-foreground leading-relaxed">
        Translate text into one or more languages with a single <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">POST /api/v1/translate</code> request.
      </p>
      <CodeBlock :code="translateCode" language="bash" label="Terminal" />
    </div>

    <div class="px-6 md:px-12 space-y-4">
      <h2 class="text-2xl font-serif font-bold tracking-tight">4. Monitor usage</h2>
      <p class="text-sm text-muted-foreground leading-relaxed">
        Track your daily request volume per API key through the dashboard or via the <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">GET /api/v1/usage</code> endpoint. Each key has a configurable daily limit, and usage is counted atomically with every request.
      </p>
      <NuxtLink
        to="/dashboard"
        class="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-all duration-200 hover:brightness-110"
      >
        Open Dashboard
        <span class="i-lucide-arrow-right text-sm" />
      </NuxtLink>
    </div>

    <div class="px-6 md:px-12 border-t border-border dark:border-gray-800 pt-8">
      <div class="rounded-2 border border-border dark:border-gray-800 bg-muted/30 p-6 flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold">Ready to dive deeper?</p>
          <p class="text-xs text-muted-foreground mt-0.5">Full endpoint documentation, request schemas, and error codes.</p>
        </div>
        <NuxtLink
          to="/docs/api-reference"
          class="rounded-lg bg-foreground px-5 py-2 text-sm font-semibold text-background transition-all duration-200 hover:brightness-110"
        >
          API Reference
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const createKeyCode = `curl -X POST 'https://francis.verbatims.cc/api/v1/keys' \\
  -H 'Authorization: Bearer <session_token>' \\
  -d '{"name": "My First Key"}'`

const detectCode = `$ curl -X POST 'https://francis.verbatims.cc/api/v1/detect' \\
  -H 'x-api-key: fcs_a1b2c3d4...' \\
  -d '{"text": "Hello world"}'

{ "language": "eng", "confidence": 0.97, "alternatives": ["spa", "fra"] }`

const translateCode = `$ curl -X POST 'https://francis.verbatims.cc/api/v1/translate' \\
  -H 'x-api-key: fcs_a1b2c3d4...' \\
  -d '{"text": "Hello world", "target": ["fr", "es", "ja"]}'

{ "translations": [{ "target": "fr", "text": "Bonjour le monde" }], "model": "openai/gpt-4o-mini" }`
</script>
