<template>
  <section class="space-y-12 border-x dark:border-gray-800 max-w-5xl mx-auto py-12">
    <div class="px-6 md:px-12 space-y-4 mt-6">
      <div class="flex items-center gap-3">
        <h1 class="font-serif text-4xl md:text-6xl font-bold tracking-tight">
          Multi-language Translation
        </h1>
      </div>
      <p class="max-w-2xl font-500 leading-relaxed text-muted-foreground dark:text-gray-400">
        Translate text into 100+ languages using AI-powered models on the edge.
        Built with configurable model fallback chains and automatic retry.
      </p>
    </div>

    <!-- Visual schema -->
    <div class="px-6 md:px-12">
      <div class="rounded-2 border border-border dark:border-gray-800 bg-gray-100 dark:bg-gray-950 overflow-hidden">
        <div class="border-b border-border dark:border-gray-800 px-6 py-3.5">
          <h2 class="text-sm font-semibold">How it works</h2>
        </div>
        <div class="p-6 md:p-10">
          <div ref="schemaContainer" class="relative flex flex-col items-center">
            <!-- SVG arrows (behind content) -->
            <svg
              v-if="arrowPaths.length > 0"
              class="absolute inset-0 w-full h-full pointer-events-none"
              :viewBox="`0 0 ${svgSize.width} ${svgSize.height}`"
              preserveAspectRatio="none"
            >
              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M 0 0 L 6 3 L 0 6 z" class="fill-foreground/30" />
                </marker>
              </defs>
              <path
                v-for="(p, i) in arrowPaths"
                :key="i"
                :d="p"
                class="stroke-foreground/30"
                stroke-width="1.2"
                fill="none"
                marker-end="url(#arrowhead)"
              />
            </svg>

            <!-- Source -->
            <div ref="sourceBox" class="relative z-10 w-full max-w-sm rounded-2 border border-primary/30 bg-primary/5 px-6 py-4 text-center">
              <p class="font-mono text-[10px] font-semibold tracking-wider text-primary/60 uppercase mb-1">Source</p>
              <p class="text-base font-medium text-foreground">Hello, how are you?</p>
              <span class="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">en &middot; English</span>
            </div>

            <!-- Spacer for arrows -->
            <div class="h-16" />

            <!-- Targets in horizontal grid -->
            <div class="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
              <div
                v-for="(lang, i) in schemaTargets"
                :key="lang.code"
                :ref="el => setTargetRef(el, i)"
                class="rounded-2 border px-4 py-3.5 flex items-center gap-3 transition-all duration-200 hover:border-primary/20"
                :class="[lang.borderClass, lang.bgClass]"
                :style="{ animationDelay: `${i * 80}ms` }"
              >
                <span class="text-2xl shrink-0">{{ lang.flag }}</span>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-foreground break-words">{{ lang.translation }}</p>
                  <span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] mt-0.5" :class="lang.tagClass">{{ lang.code }} &middot; {{ lang.name }}</span>
                </div>
              </div>
            </div>

            <!-- Caption -->
            <p class="relative z-10 mt-8 font-mono text-[10px] tracking-wider uppercase text-muted-foreground/40">AI Translation</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Parameters -->
    <div class="px-6 md:px-12 space-y-4">
      <h2 class="text-2xl font-serif font-bold tracking-tight">Parameters</h2>
      <div class="rounded-2 border border-border dark:border-gray-800 overflow-hidden">
        <div class="divide-y divide-border dark:divide-gray-800">
          <div v-for="param in params" :key="param.name" class="grid grid-cols-[auto_1fr_auto] gap-4 px-6 py-4 items-center">
            <div>
              <code class="font-mono text-sm font-semibold">{{ param.name }}</code>
              <span class="ml-2 rounded-md bg-rose-400/10 dark:bg-rose-400/20 px-2 py-0.5 font-mono text-[10px] text-rose-400" v-if="param.required">required</span>
              <span class="ml-2 rounded-md bg-muted dark:bg-gray-800 px-2 py-0.5 font-mono text-[10px] text-muted-foreground" v-else>optional</span>
            </div>
            <div class="text-sm text-muted-foreground dark:text-gray-400">{{ param.description }}</div>
            <code class="font-mono text-xs text-muted-foreground/60 text-right">{{ param.type }}</code>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive demo -->
    <div class="px-6 md:px-12 space-y-4">
      <h2 class="text-2xl font-serif font-bold tracking-tight">Try it out</h2>
      <div class="rounded-2 border border-border dark:border-gray-800 bg-background shadow-md overflow-hidden">
        <div class="p-6 space-y-4">
          <div>
            <label class="font-mono text-xs font-semibold tracking-wider text-muted-foreground/60 uppercase">Text to translate</label>
            <textarea
              v-model="demoText"
              class="mt-2 w-full rounded-lg border border-border bg-gray-200 dark:bg-gray-900  px-4 py-3 font-mono text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
              rows="3"
              placeholder="Enter text to translate..."
            />
          </div>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="lang in availableLangs"
              :key="lang.code"
              @click="toggleLang(lang.code)"
              class="rounded-full border px-3 py-1.5 text-xs font-500 transition-all duration-200"
              :class="demoTargets.includes(lang.code)
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'"
            >
              {{ lang.flag }} {{ lang.name }}
            </button>
          </div>
          <button
            class="rounded-lg bg-foreground px-6 py-2 text-sm font-semibold text-background transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!demoText.trim() || demoTargets.length === 0 || demoLoading"
            @click="runDemo"
          >
            <span v-if="demoLoading" class="inline-flex items-center gap-2">
              <span class="i-lucide-loader-2 animate-spin text-xs" />
              Translating
            </span>
            <span v-else>Translate</span>
          </button>

          <Transition name="fade">
            <div v-if="demoResult.length > 0" class="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <div v-for="r in demoResult" :key="r.target" class="flex items-start gap-3">
                <span class="mt-0.5 shrink-0 text-lg">{{ langFlag(r.target) }}</span>
                <div>
                  <p class="font-mono text-[11px] text-muted-foreground/60">{{ langName(r.target) }}</p>
                  <p class="text-sm text-foreground">{{ r.text }}</p>
                </div>
              </div>
            </div>
          </Transition>

          <Transition name="fade">
            <p v-if="demoError" class="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-400">{{ demoError }}</p>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Code examples with tabs -->
    <div class="px-6 md:px-12 space-y-4">
      <h2 class="text-2xl font-serif font-bold tracking-tight">Code examples</h2>
      <div class="rounded-2 border border-border dark:border-gray-800 shadow-md overflow-hidden">
        <!-- Tabs -->
        <div class="flex border-b border-border dark:border-gray-800">
          <button
            v-for="tab in codeTabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-5 py-3 text-xs font-semibold font-mono tracking-wider transition-all duration-200 border-b-2 -mb-[1px]"
            :class="activeTab === tab.id
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'"
          >
            {{ tab.label }}
          </button>
        </div>
        <!-- Code -->
        <div class="p-6">
          <pre class="rounded-xl border border-border dark:border-gray-800 bg-muted/30 p-4 font-mono text-xs leading-relaxed text-foreground overflow-x-auto">{{ activeCode }}</pre>
        </div>
      </div>
    </div>

    <!-- Usage info -->
    <div class="px-6 md:px-12 border-t border-border dark:border-gray-800 pt-8 space-y-4">
      <h2 class="text-2xl font-serif font-bold tracking-tight">Usage &amp; limits</h2>
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-2 border border-border dark:border-gray-800 bg-gray-100 dark:bg-gray-950 p-5 hover:bg-card hover:border-pink transition-[colors] duration-300">
          <span class="i-lucide-coins text-xl text-muted-foreground/50" />
          <p class="mt-3 text-sm font-semibold">Weighted pricing</p>
          <p class="mt-1 text-xs text-muted-foreground">Translation requests consume 3× the quota of detection requests to account for API costs.</p>
        </div>
        <div class="rounded-2 border border-border dark:border-gray-800 bg-gray-100 dark:bg-gray-950 p-5 hover:bg-card hover:border-blue transition-[colors] duration-300">
          <span class="i-lucide-maximize-2 text-xl text-muted-foreground/50" />
          <p class="mt-3 text-sm font-semibold">Batch limits</p>
          <p class="mt-1 text-xs text-muted-foreground">Up to 10 texts per request, 5,000 characters each, 10 target languages.</p>
        </div>
        <div class="rounded-2 border border-border dark:border-gray-800 bg-gray-100 dark:bg-gray-950 p-5 hover:bg-card hover:border-amber transition-[colors] duration-300">
          <span class="i-lucide-shuffle text-xl text-muted-foreground/50" />
          <p class="mt-3 text-sm font-semibold">Model fallback</p>
          <p class="mt-1 text-xs text-muted-foreground">Automatic retry with fallback models if the primary translation model fails.</p>
        </div>
      </div>
      <p class="text-xs font-500 text-muted-foreground/40 dark:text-gray-400 leading-relaxed">
        Powered by <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer"
          class="underline underline-offset-2 decoration-muted-foreground/20 hover:decoration-foreground/60 transition-colors">OpenRouter</a>.
        Translation models are configurable from the
        <NuxtLink to="/admin" class="underline underline-offset-2 decoration-muted-foreground/20 hover:decoration-foreground/60 transition-colors">admin panel</NuxtLink>.
        Supports all ISO 639-1 language codes.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { ComponentPublicInstance } from 'vue'

interface Param {
  name: string
  description: string
  type: string
  required: boolean
}

const params: Param[] = [
  { name: 'text', description: 'Text or array of texts to translate.', type: 'string | string[]', required: true },
  { name: 'target', description: 'Target language code(s) — ISO 639-1 (e.g. fr, es, ja).', type: 'string | string[]', required: true },
  { name: 'source', description: 'Source language code. Auto-detected if omitted.', type: 'string', required: false },
]

const schemaTargets = [
  { code: 'fr', name: 'French', flag: '🇫🇷', translation: 'Bonjour, comment allez-vous ?', borderClass: 'border-sky-300/40 dark:border-sky-500/30', bgClass: 'bg-sky-50 dark:bg-sky-950/20', tagClass: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', translation: 'こんにちは、お元気ですか？', borderClass: 'border-rose-300/40 dark:border-rose-500/30', bgClass: 'bg-rose-50 dark:bg-rose-950/20', tagClass: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
  { code: 'de', name: 'German', flag: '🇩🇪', translation: 'Hallo, wie geht es Ihnen?', borderClass: 'border-amber-300/40 dark:border-amber-500/30', bgClass: 'bg-amber-50 dark:bg-amber-950/20', tagClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
]

const schemaContainer = ref<HTMLElement | null>(null)
const sourceBox = ref<HTMLElement | null>(null)
const targetRefs = ref<(HTMLElement | null)[]>([null, null, null])
const arrowPaths = ref<string[]>([])
const svgSize = ref({ width: 0, height: 0 })

function setTargetRef(el: Element | ComponentPublicInstance | null, i: number) {
  targetRefs.value[i] = el as HTMLElement | null
}

function recomputeArrows() {
  if (!schemaContainer.value || !sourceBox.value) return
  const c = schemaContainer.value.getBoundingClientRect()
  const s = sourceBox.value.getBoundingClientRect()

  const sourceX = s.left + s.width / 2 - c.left
  const sourceY = s.bottom - c.top

  const paths: string[] = []
  for (const tEl of targetRefs.value) {
    if (!tEl) continue
    const t = tEl.getBoundingClientRect()
    const targetX = t.left + t.width / 2 - c.left
    const targetY = t.top - c.top
    const midY = (sourceY + targetY) / 2
    paths.push(`M ${sourceX} ${sourceY} C ${sourceX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`)
  }

  svgSize.value = { width: c.width, height: c.height }
  arrowPaths.value = paths
}

let resizeObserver: ResizeObserver | null = null
onMounted(() => {
  nextTick(() => {
    recomputeArrows()
    if (schemaContainer.value) {
      resizeObserver = new ResizeObserver(() => recomputeArrows())
      resizeObserver.observe(schemaContainer.value)
      targetRefs.value.forEach(el => el && resizeObserver!.observe(el))
    }
  })
  window.addEventListener('resize', recomputeArrows)
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', recomputeArrows)
})

const availableLangs = [
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
]

const LANG_FLAGS: Record<string, string> = Object.fromEntries(availableLangs.map(l => [l.code, l.flag]))
const LANG_NAMES: Record<string, string> = Object.fromEntries(availableLangs.map(l => [l.code, l.name]))

function langFlag(code: string): string {
  return LANG_FLAGS[code] ?? ''
}
function langName(code: string): string {
  return LANG_NAMES[code] ?? code
}

const demoText = ref('The future belongs to those who believe in the beauty of their dreams.')
const demoTargets = ref<string[]>(['fr', 'es', 'ja'])
const demoLoading = ref(false)
const demoResult = ref<Array<{ target: string; text: string }>>([])
const demoError = ref('')

function toggleLang(code: string) {
  const idx = demoTargets.value.indexOf(code)
  if (idx >= 0) {
    demoTargets.value.splice(idx, 1)
  } else {
    demoTargets.value.push(code)
  }
}

async function runDemo() {
  demoLoading.value = true
  demoError.value = ''
  demoResult.value = []

  try {
    const res = await $fetch('/api/demo/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { text: demoText.value, target: demoTargets.value },
    })
    demoResult.value = res.translations
  } catch (err: any) {
    demoError.value = err?.data?.statusMessage || err?.message || 'Translation failed'
  } finally {
    demoLoading.value = false
  }
}

const codeTabs = [
  { id: 'curl', label: 'cURL' },
  { id: 'js', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
]

const activeTab = ref('curl')

const activeCode = computed(() => {
  switch (activeTab.value) {
    case 'curl':
      return `curl -X POST https://francis.verbatims.cc/api/v1/translate \\
  -H "x-api-key: fcs_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello, how are you?",
    "target": ["fr", "ja", "de"]
  }'`
    case 'js':
      return `const response = await fetch('https://francis.verbatims.cc/api/v1/translate', {
  method: 'POST',
  headers: {
    'x-api-key': 'fcs_your_key_here',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Hello, how are you?',
    target: ['fr', 'ja', 'de'],
  }),
})
const data = await response.json()
console.log(data.translations)`
    case 'python':
      return `import requests

response = requests.post(
    'https://francis.verbatims.cc/api/v1/translate',
    headers={'x-api-key': 'fcs_your_key_here'},
    json={
        'text': 'Hello, how are you?',
        'target': ['fr', 'ja', 'de'],
    },
)
data = response.json()
print(data['translations'])`
    default:
      return ''
  }
})
</script>
