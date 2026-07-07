<template>
  <section class="space-y-12 border-x dark:border-gray-800 max-w-4xl mx-auto py-12">
    <div class="px-6 md:px-12 space-y-4 mt-6">
      <div class="flex items-center gap-3">
        <h1 class="font-serif text-4xl md:text-6xl font-bold tracking-tight">
          API Reference
        </h1>
      </div>
      <p class="max-w-2xl text-base leading-relaxed text-muted-foreground">
        Complete documentation for the Francis API. All endpoints are hosted at <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">https://francis.verbatims.cc/api/v1</code>.
      </p>
    </div>

    <!-- Authentication -->
    <div class="px-6 md:px-12 space-y-4">
      <h2 class="text-2xl font-serif font-bold tracking-tight">Authentication</h2>
      <p class="text-sm text-muted-foreground leading-relaxed">
        All API requests require an API key passed via the <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">x-api-key</code> header or <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">Authorization: Bearer</code> header. Keys are prefixed with <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">fcs_</code> and managed through the dashboard.
      </p>
      <div class="rounded-2 border border-border dark:border-gray-800 bg-gray-200 dark:bg-gray-950 overflow-hidden">
        <div class="px-4 py-3 font-mono text-xs leading-loose">
          <span class="text-muted-foreground/40"># Recommended</span><br/>
          <span class="text-muted-foreground/40">x-api-key: </span><span class="text-accent">fcs_a1b2c3d4...</span><br/><br/>
          <span class="text-muted-foreground/40"># Alternative</span><br/>
          <span class="text-muted-foreground/40">Authorization: Bearer </span><span class="text-accent">fcs_a1b2c3d4...</span>
        </div>
      </div>
    </div>

    <!-- Endpoints -->
    <div class="px-6 md:px-12 space-y-8">
      <h2 class="text-2xl font-serif font-bold tracking-tight">Endpoints</h2>

      <!-- Detect -->
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <span class="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-500">POST</span>
          <span class="font-mono text-sm font-semibold">/api/v1/detect</span>
        </div>
        <p class="text-sm text-muted-foreground leading-relaxed">
          Detect the language of a text string. Uses franc-all under the hood for trigram-based detection. Returns an ISO 639-3 language code, confidence score, and alternative candidates.
        </p>

        <div class="rounded-2 border border-border dark:border-gray-800 overflow-hidden">
          <div class="border-b border-border dark:border-gray-800 px-4 py-2 bg-muted/20">
            <span class="text-xs font-semibold text-muted-foreground">Request body</span>
          </div>
          <div class="p-4 space-y-3 text-sm">
            <div class="flex items-start justify-between">
              <div>
                <span class="font-mono text-xs font-semibold">text</span>
                <span class="ml-2 rounded bg-red-500/10 px-1.5 py-0.5 font-mono text-[10px] text-red-500">required</span>
              </div>
              <span class="font-mono text-[10px] text-muted-foreground/50">string</span>
            </div>
            <p class="text-xs text-muted-foreground">The text to detect.</p>

            <div class="flex items-start justify-between">
              <div>
                <span class="font-mono text-xs font-semibold">minLength</span>
                <span class="ml-2 rounded bg-gray-500/10 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">optional</span>
              </div>
              <span class="font-mono text-[10px] text-muted-foreground/50">number</span>
            </div>
            <p class="text-xs text-muted-foreground">Minimum text length for reliable detection. Default <code class="rounded bg-muted px-1 font-mono text-[10px]">10</code>.</p>

            <div class="flex items-start justify-between">
              <div>
                <span class="font-mono text-xs font-semibold">only</span>
                <span class="ml-2 rounded bg-gray-500/10 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">optional</span>
              </div>
              <span class="font-mono text-[10px] text-muted-foreground/50">string[]</span>
            </div>
            <p class="text-xs text-muted-foreground">Restrict detection to specific ISO 639-3 language codes.</p>
          </div>
        </div>

        <div class="rounded-2 border border-border dark:border-gray-800 overflow-hidden">
          <div class="border-b border-border dark:border-gray-800 px-4 py-2 bg-muted/20">
            <span class="text-xs font-semibold text-muted-foreground">Response</span>
          </div>
          <div class="p-4 space-y-3 text-sm">
            <div class="flex items-start justify-between">
              <div><span class="font-mono text-xs font-semibold">language</span></div>
              <span class="font-mono text-[10px] text-muted-foreground/50">string</span>
            </div>
            <p class="text-xs text-muted-foreground">ISO 639-3 code (<code class="rounded bg-muted px-1 font-mono text-[10px]">eng</code>, <code class="rounded bg-muted px-1 font-mono text-[10px]">fra</code>) or <code class="rounded bg-muted px-1 font-mono text-[10px]">und</code> for undetermined.</p>

            <div class="flex items-start justify-between">
              <div><span class="font-mono text-xs font-semibold">score</span></div>
              <span class="font-mono text-[10px] text-muted-foreground/50">number</span>
            </div>
            <p class="text-xs text-muted-foreground">Raw franc score (lower is better).</p>

            <div class="flex items-start justify-between">
              <div><span class="font-mono text-xs font-semibold">confidence</span></div>
              <span class="font-mono text-[10px] text-muted-foreground/50">number</span>
            </div>
            <p class="text-xs text-muted-foreground">Computed confidence from 0 to 1 based on score gap and text length.</p>

            <div class="flex items-start justify-between">
              <div><span class="font-mono text-xs font-semibold">alternatives</span></div>
              <span class="font-mono text-[10px] text-muted-foreground/50">Array&lt;{language, score}&gt;</span>
            </div>
            <p class="text-xs text-muted-foreground">Top 5 alternative candidates.</p>
          </div>
        </div>

        <details class="group">
          <summary class="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
            <span class="i-lucide-chevron-right text-[10px] inline-block group-open:rotate-90 transition-transform" />
            Example request
          </summary>
          <div class="mt-2 rounded-2 border border-border dark:border-gray-800 bg-gray-200 dark:bg-gray-950 overflow-hidden">
            <div class="flex items-center gap-3 px-4 py-2 border-b border-border dark:border-gray-800">
              <span class="text-[10px] text-muted-foreground/50">bash</span>
            </div>
            <div class="px-4 py-3 font-mono text-xs leading-loose">
              <div class="flex items-start gap-2">
                <span class="text-muted-foreground/30 shrink-0">$</span>
                <div>
                  <span class="text-muted-foreground/40">curl -X POST</span>
                  <span class="text-blue-500">'https://francis.verbatims.cc/api/v1/detect'</span><br/>
                  <span class="text-muted-foreground/40">&nbsp;&nbsp;-H 'x-api-key: fcs_...'</span><br/>
                  <span class="text-muted-foreground/40">&nbsp;&nbsp;-d</span>
                  <span class="text-emerald-600 dark:text-emerald-400">'{"text": "Bonjour le monde"}'</span>
                </div>
              </div>
              <div class="mt-2 flex items-start gap-2">
                <span class="text-emerald-500 shrink-0">&rarr;</span>
                <span class="text-background/60 dark:text-foreground">{ "language": "fra", "confidence": 0.98, "alternatives": ["ita", "spa"] }</span>
              </div>
            </div>
          </div>
        </details>
      </div>

      <!-- Translate -->
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <span class="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-500">POST</span>
          <span class="font-mono text-sm font-semibold">/api/v1/translate</span>
        </div>
        <p class="text-sm text-muted-foreground leading-relaxed">
          Translate text into one or more target languages. Uses OpenRouter multi-model AI with automatic fallback. Supports batch translation of up to 10 texts.
        </p>

        <div class="rounded-2 border border-border dark:border-gray-800 overflow-hidden">
          <div class="border-b border-border dark:border-gray-800 px-4 py-2 bg-muted/20">
            <span class="text-xs font-semibold text-muted-foreground">Request body</span>
          </div>
          <div class="p-4 space-y-3 text-sm">
            <div class="flex items-start justify-between">
              <div>
                <span class="font-mono text-xs font-semibold">text</span>
                <span class="ml-2 rounded bg-red-500/10 px-1.5 py-0.5 font-mono text-[10px] text-red-500">required</span>
              </div>
              <span class="font-mono text-[10px] text-muted-foreground/50">string | string[]</span>
            </div>
            <p class="text-xs text-muted-foreground">Text to translate, or an array of up to 10 texts. Each capped at 5,000 characters.</p>

            <div class="flex items-start justify-between">
              <div>
                <span class="font-mono text-xs font-semibold">target</span>
                <span class="ml-2 rounded bg-red-500/10 px-1.5 py-0.5 font-mono text-[10px] text-red-500">required</span>
              </div>
              <span class="font-mono text-[10px] text-muted-foreground/50">string | string[]</span>
            </div>
            <p class="text-xs text-muted-foreground">ISO 639-1 language code(s). Max 10 targets per request.</p>

            <div class="flex items-start justify-between">
              <div>
                <span class="font-mono text-xs font-semibold">source</span>
                <span class="ml-2 rounded bg-gray-500/10 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">optional</span>
              </div>
              <span class="font-mono text-[10px] text-muted-foreground/50">string</span>
            </div>
            <p class="text-xs text-muted-foreground">Source language hint (ISO 639-1). If omitted, the source is auto-detected.</p>
          </div>
        </div>

        <div class="rounded-2 border border-border dark:border-gray-800 overflow-hidden">
          <div class="border-b border-border dark:border-gray-800 px-4 py-2 bg-muted/20">
            <span class="text-xs font-semibold text-muted-foreground">Response</span>
          </div>
          <div class="p-4 space-y-3 text-sm">
            <div class="flex items-start justify-between">
              <div><span class="font-mono text-xs font-semibold">translations</span></div>
              <span class="font-mono text-[10px] text-muted-foreground/50">Array</span>
            </div>
            <p class="text-xs text-muted-foreground">Each entry contains <code class="rounded bg-muted px-1 font-mono text-[10px]">target</code>, <code class="rounded bg-muted px-1 font-mono text-[10px]">text</code>, and optionally <code class="rounded bg-muted px-1 font-mono text-[10px]">detectedSource</code>.</p>

            <div class="flex items-start justify-between">
              <div><span class="font-mono text-xs font-semibold">model</span></div>
              <span class="font-mono text-[10px] text-muted-foreground/50">string</span>
            </div>
            <p class="text-xs text-muted-foreground">The OpenRouter model used for translation.</p>
          </div>
        </div>

        <details class="group">
          <summary class="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
            <span class="i-lucide-chevron-right text-[10px] inline-block group-open:rotate-90 transition-transform" />
            Example request
          </summary>
          <div class="mt-2 rounded-2 border border-border dark:border-gray-800 bg-gray-200 dark:bg-gray-950 overflow-hidden">
            <div class="px-4 py-3 font-mono text-xs leading-loose">
              <div class="flex items-start gap-2">
                <span class="text-muted-foreground/30 shrink-0">$</span>
                <div>
                  <span class="text-muted-foreground/40">curl -X POST</span>
                  <span class="text-blue-500">'https://francis.verbatims.cc/api/v1/translate'</span><br/>
                  <span class="text-muted-foreground/40">&nbsp;&nbsp;-H 'x-api-key: fcs_...'</span><br/>
                  <span class="text-muted-foreground/40">&nbsp;&nbsp;-d</span>
                  <span class="text-emerald-600 dark:text-emerald-400">'{"text": "Good morning", "target": ["fr", "de"]}'</span>
                </div>
              </div>
            </div>
          </div>
        </details>
      </div>

      <!-- Health -->
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <span class="rounded-md bg-blue-500/15 px-2 py-0.5 font-mono text-[11px] font-bold text-blue-500">GET</span>
          <span class="font-mono text-sm font-semibold">/api/v1/health</span>
        </div>
        <p class="text-sm text-muted-foreground leading-relaxed">
          Health check endpoint. No authentication required. Returns service status and current timestamp.
        </p>
        <div class="rounded-2 border border-border dark:border-gray-800 overflow-hidden">
          <div class="border-b border-border dark:border-gray-800 px-4 py-2 bg-muted/20">
            <span class="text-xs font-semibold text-muted-foreground">Response</span>
          </div>
          <div class="p-4 space-y-2 text-sm">
            <div class="flex items-start justify-between">
              <div><span class="font-mono text-xs font-semibold">ok</span></div>
              <span class="font-mono text-[10px] text-muted-foreground/50">boolean</span>
            </div>
            <div class="flex items-start justify-between">
              <div><span class="font-mono text-xs font-semibold">service</span></div>
              <span class="font-mono text-[10px] text-muted-foreground/50">"francis"</span>
            </div>
            <div class="flex items-start justify-between">
              <div><span class="font-mono text-xs font-semibold">timestamp</span></div>
              <span class="font-mono text-[10px] text-muted-foreground/50">number</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Usage -->
      <div class="space-y-3 pt-4 border-t border-border dark:border-gray-800">
        <div class="flex items-center gap-2">
          <span class="rounded-md bg-blue-500/15 px-2 py-0.5 font-mono text-[11px] font-bold text-blue-500">GET</span>
          <span class="font-mono text-sm font-semibold">/api/v1/usage</span>
        </div>
        <p class="text-sm text-muted-foreground leading-relaxed">
          Retrieve usage statistics for a specific API key. Requires session-based authentication (dashboard login). Returns daily request counts for the last 60 days.
        </p>
        <div class="rounded-2 border border-border dark:border-gray-800 overflow-hidden">
          <div class="border-b border-border dark:border-gray-800 px-4 py-2 bg-muted/20">
            <span class="text-xs font-semibold text-muted-foreground">Query parameters</span>
          </div>
          <div class="p-4 space-y-2 text-sm">
            <div class="flex items-start justify-between">
              <div>
                <span class="font-mono text-xs font-semibold">apiKeyId</span>
                <span class="ml-2 rounded bg-red-500/10 px-1.5 py-0.5 font-mono text-[10px] text-red-500">required</span>
              </div>
              <span class="font-mono text-[10px] text-muted-foreground/50">string</span>
            </div>
            <p class="text-xs text-muted-foreground">The API key ID to query.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="px-6 md:px-12 space-y-4">
      <h2 class="text-2xl font-serif font-bold tracking-tight">Error codes</h2>
      <div class="rounded-2 border border-border dark:border-gray-800 overflow-hidden">
        <div class="divide-y divide-border dark:divide-gray-800">
          <div v-for="err in errors" :key="err.code" class="flex gap-4 px-5 py-3">
            <span class="font-mono text-xs font-bold shrink-0" :class="err.colorClass">{{ err.code }}</span>
            <div>
              <p class="text-xs font-medium">{{ err.message }}</p>
              <p class="text-[11px] text-muted-foreground mt-0.5">{{ err.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const errors = [
  { code: '400', message: 'Bad Request', description: 'Missing or invalid parameters. Check your request body.', colorClass: 'text-amber-500' },
  { code: '401', message: 'Unauthorized', description: 'Missing or invalid API key.', colorClass: 'text-red-500' },
  { code: '403', message: 'Forbidden', description: 'You do not have permission to access this resource.', colorClass: 'text-red-500' },
  { code: '404', message: 'Not Found', description: 'The requested resource was not found.', colorClass: 'text-amber-500' },
  { code: '429', message: 'Rate Limited', description: 'Daily usage cap exceeded. Try again tomorrow or increase your limit.', colorClass: 'text-orange-500' },
  { code: '502', message: 'Bad Gateway', description: 'Translation failed — all AI models returned errors.', colorClass: 'text-red-500' },
  { code: '503', message: 'Service Unavailable', description: 'Service not configured or temporarily unavailable.', colorClass: 'text-red-500' },
]
</script>
