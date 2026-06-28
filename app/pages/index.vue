<template>
  <section class="space-y-16 border-x max-w-6xl mx-auto px-12 py-12">
    <!-- Hero -->
    <div class="space-y-8">
      <!-- Headline -->
      <h1 class="max-w-4xl font-sans text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-[5rem]">
        Detect <span class="text-accent">language</span> in <span class="group relative inline-block"><span class="relative z-10">milliseconds</span><span class="absolute right-0 top-0 translate-x-2 -translate-y-1.5 opacity-0 group-hover:opacity-50 dark:group-hover:opacity-60 group-hover:block transition-all duration-500 delay-75 pointer-events-none select-none"><span class="text-blue-500">milliseconds</span></span><span class="absolute right-0 top-0 translate-x-3.5 opacity-0 group-hover:opacity-40 dark:group-hover:opacity-50 transition-all duration-500 delay-150 pointer-events-none select-none"><span class="text-rose-400">milliseconds</span></span><span class="absolute right-0 top-0 translate-x-5 -translate-y-1 opacity-0 group-hover:opacity-30 dark:group-hover:opacity-40 transition-all duration-500 delay-225 pointer-events-none select-none"><span class="text-accent">milliseconds</span></span></span>. The edge-native API
      </h1>

      <!-- Subtitle -->
      <p class="max-w-2xl text-lg font-500 leading-relaxed text-muted-foreground">
        Francis brings franc-all to Cloudflare Workers. Ship language detection
        in milliseconds with API keys, usage tracking, and a modern console.
      </p>

      <!-- Badge -->
      <div class="inline-flex items-center gap-3 rounded-1 bg-foreground
        px-5 py-2 text-sm font-600 text-background
        dark:bg-transparent dark:text-white border border-gray-500">
        <span>Francis is now live on Cloudflare Workers</span>
        <span class="opacity-30">|</span>
        <span class="opacity-80">Learn more</span>
        <span class="opacity-60">&rarr;</span>
      </div>
    </div>

    <!-- Product showcase -->
    <div class="animate-slide-up overflow-hidden rounded-2 border border-border bg-[#eee] p-8 md:p-12 lg:p-16">
      <!-- Meta line -->
      <div v-if="feed" class="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-4 font-mono text-[11px] text-muted-foreground/60">
        <span class="flex items-center gap-1.5">
          <span class="i-lucide-calendar h-3 w-3" />
          {{ feed.date }}
        </span>
        <span class="flex items-center gap-1.5">
          <span class="i-lucide-clock h-3 w-3" />
          {{ feed.time }}
        </span>
        <span class="flex items-center gap-1.5">
          <span class="i-lucide-map-pin h-3 w-3" />
          {{ feed.city }}
        </span>
        <span v-if="feed.weather" class="flex items-center gap-1.5">
          <span class="i-lucide-thermometer h-3 w-3" />
          {{ feed.weather.temp }}°C &middot; {{ feed.weather.description }}
        </span>
        <span v-if="feed.sun" class="flex items-center gap-1.5">
          <span class="i-lucide-sun h-3 w-3" />
          ↑ {{ feed.sun.sunrise }} / ↓ {{ feed.sun.sunset }}
        </span>
        <span v-if="feed.exchangeRate" class="flex items-center gap-1.5">
          <span class="i-lucide-banknote h-3 w-3" />
          1 {{ feed.exchangeRate.base }} = {{ feed.exchangeRate.rate.toFixed(3) }} {{ feed.exchangeRate.target }}
        </span>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="space-y-3">
        <div class="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div class="h-5 w-2/3 animate-pulse rounded bg-muted" />
        <div class="h-5 w-1/2 animate-pulse rounded bg-muted" />
        <div class="h-5 w-3/5 animate-pulse rounded bg-muted" />
      </div>

      <!-- Paragraph -->
      <p v-else class="max-w-3xl text-lg leading-relaxed tracking-tight md:text-xl lg:leading-[1.6]">
        <span
          v-for="(sentence, i) in sentences"
          :key="i"
          class="group relative mr-2 cursor-pointer transition-colors duration-200"
          @click="cycleLanguage(i)"
        >
          <span
            :style="{ '--sentence-color': `var(--lang-${activeVariant(sentence, i).code})` }"
            class="inline border-b border-dashed border-foreground/20 text-[var(--sentence-color)] transition-colors duration-200 group-hover:border-foreground/60 group-hover:bg-foreground/[0.04] group-hover:text-foreground"
          >
            {{ displayedSentences[i] }}
            <span
              v-if="isTyping && i === currentTypingIndex"
              class="ml-0.5 inline-block h-[1em] w-[2px] -mb-0.5 bg-foreground animate-cursor align-middle"
            />
          </span>
          <span class="invisible absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-card p-2 text-xs shadow-lg opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 z-10">
            <span class="flex items-center gap-2">
              <span class="text-base leading-none">{{ activeVariant(sentence, i).flag }}</span>
              <span class="font-medium text-foreground/90">{{ activeVariant(sentence, i).name }}</span>
              <span class="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{{ activeVariant(sentence, i).code }}</span>
              <span class="font-mono text-[10px] text-muted-foreground/50">{{ activeVariant(sentence, i).confidence }}%</span>
            </span>
          </span>
        </span>
      </p>

      <div class="mt-10 flex items-center justify-between border-t border-border pt-6">
        <p class="text-[10px] text-muted-foreground/50">Multilingual text &middot; {{ sentences.length }} sentences &middot; {{ sentences.length }} languages</p>
        <div class="flex items-center gap-2 text-[10px] text-muted-foreground/40">
          <span class="i-lucide-mouse-pointer-2 h-3 w-3" />
          <span class="text-[10px] text-muted-foreground/50">Click any sentence to switch its language</span>
        </div>
      </div>
    </div>

    <!-- Features -->
    <div class="grid gap-6 md:grid-cols-3">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-md"
      >
        <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
          <span :class="feature.icon" class="text-base text-foreground" />
        </div>
        <h3 class="text-lg font-semibold tracking-tight">{{ feature.title }}</h3>
        <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ feature.description }}</p>
      </div>
    </div>

    <!-- API Quickstart -->
    <div id="api" class="space-y-8 rounded-2xl border border-border bg-card p-8 shadow-sm lg:p-10">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-semibold tracking-tight">API quickstart</h2>
          <p class="mt-1 text-sm text-muted-foreground">One endpoint, one header, any language.</p>
        </div>
        <span class="rounded-full border border-border bg-muted px-4 py-1.5 text-xs text-muted-foreground">francis.verbatims.cc</span>
      </div>
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-3">
          <p class="text-xs text-muted-foreground uppercase">Headers</p>
          <pre class="rounded-xl bg-muted/60 p-4 font-mono text-xs leading-relaxed text-foreground"><span class="text-muted-foreground/40">x-api-key:</span> fcs_************************</pre>
        </div>
        <div class="space-y-3">
          <p class="text-xs text-muted-foreground uppercase">Request</p>
          <pre class="rounded-xl bg-muted/60 p-4 font-mono text-xs leading-relaxed text-foreground"><span class="text-muted-foreground/40">POST /api/v1/detect</span>
{ <span class="text-muted-foreground/40">"text"</span>: <span class="text-emerald-600 dark:text-emerald-400">"Hello from Verbatims"</span> }</pre>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface SentenceVariant {
  text: string
  flag: string
  name: string
  code: string
  confidence: number
}

interface MultiLangSentence {
  variants: SentenceVariant[]
}

interface FeedResponse {
  date: string
  time: string
  city: string
  weather: { temp: number, description: string, code: number } | null
  sun: { sunrise: string, sunset: string } | null
  hackerNews: { title: string, url: string, by: string } | null
  wikipedia: { text: string, year: number } | null
  quote: { text: string, author: string, lang: 'en' | 'fr' } | null
  exchangeRate: { base: string, target: string, rate: number } | null
  segments: Array<{
    text: string
    lang: string
    translations: { fr?: string, es?: string, de?: string, it?: string }
  }>
}

const LANG_MAP: Record<string, { flag: string, name: string, code: string }> = {
  en: { flag: '🇬🇧', name: 'English', code: 'eng' },
  fr: { flag: '🇫🇷', name: 'French', code: 'fra' },
  es: { flag: '🇪🇸', name: 'Spanish', code: 'spa' },
  de: { flag: '🇩🇪', name: 'German', code: 'deu' },
  it: { flag: '🇮🇹', name: 'Italian', code: 'ita' },
}

const FALLBACK_SENTENCES: MultiLangSentence[] = [
  {
    variants: [
      { text: 'Curiosity is the spark that ignites all learning. ', flag: '🇬🇧', name: 'English', code: 'eng', confidence: 97 },
      { text: 'La curiosité est l\'étincelle qui enflamme tout apprentissage. ', flag: '🇫🇷', name: 'French', code: 'fra', confidence: 95 },
      { text: 'La curiosidad es la chispa que enciende todo aprendizaje. ', flag: '🇪🇸', name: 'Spanish', code: 'spa', confidence: 94 },
      { text: 'Neugier ist der Funke, der alles Lernen entfacht. ', flag: '🇩🇪', name: 'German', code: 'deu', confidence: 93 },
      { text: 'La curiosità è la scintilla che accende ogni apprendimento. ', flag: '🇮🇹', name: 'Italian', code: 'ita', confidence: 94 },
      { text: '好奇心はすべての学びの火花である。', flag: '🇯🇵', name: 'Japanese', code: 'jpn', confidence: 90 },
    ],
  },
  {
    variants: [
      { text: 'It turns the unknown into discovery. ', flag: '🇬🇧', name: 'English', code: 'eng', confidence: 95 },
      { text: 'Elle transforme l\'inconnu en découverte. ', flag: '🇫🇷', name: 'French', code: 'fra', confidence: 97 },
      { text: 'Convierte lo desconocido en descubrimiento. ', flag: '🇪🇸', name: 'Spanish', code: 'spa', confidence: 94 },
      { text: 'Sie verwandelt das Unbekannte in Entdeckung. ', flag: '🇩🇪', name: 'German', code: 'deu', confidence: 93 },
      { text: 'Trasforma l\'ignoto in scoperta. ', flag: '🇮🇹', name: 'Italian', code: 'ita', confidence: 94 },
    ],
  },
  {
    variants: [
      { text: 'Without it, the world would be a place without questions. ', flag: '🇬🇧', name: 'English', code: 'eng', confidence: 95 },
      { text: 'Sans elle, le monde serait un lieu sans questions. ', flag: '🇫🇷', name: 'French', code: 'fra', confidence: 94 },
      { text: 'Sin ella, el mundo sería un lugar sin preguntas. ', flag: '🇪🇸', name: 'Spanish', code: 'spa', confidence: 97 },
      { text: 'Ohne sie wäre die Welt ein Ort ohne Fragen. ', flag: '🇩🇪', name: 'German', code: 'deu', confidence: 93 },
      { text: 'Senza di essa, il mondo sarebbe un luogo senza domande. ', flag: '🇮🇹', name: 'Italian', code: 'ita', confidence: 94 },
    ],
  },
  {
    variants: [
      { text: 'But with it, every question becomes a journey. ', flag: '🇬🇧', name: 'English', code: 'eng', confidence: 95 },
      { text: 'Mais avec elle, chaque question devient un voyage. ', flag: '🇫🇷', name: 'French', code: 'fra', confidence: 94 },
      { text: 'Pero con ella, cada pregunta se convierte en un viaje. ', flag: '🇪🇸', name: 'Spanish', code: 'spa', confidence: 93 },
      { text: 'Doch mit ihr wird jede Frage zu einer Reise. ', flag: '🇩🇪', name: 'German', code: 'deu', confidence: 97 },
      { text: 'Ma con essa, ogni domanda diventa un viaggio. ', flag: '🇮🇹', name: 'Italian', code: 'ita', confidence: 94 },
    ],
  },
  {
    variants: [
      { text: 'And every journey enriches those who undertake it. ', flag: '🇬🇧', name: 'English', code: 'eng', confidence: 95 },
      { text: 'Et chaque voyage enrichit ceux qui l\'entreprennent. ', flag: '🇫🇷', name: 'French', code: 'fra', confidence: 94 },
      { text: 'Y cada viaje enriquece a quienes lo emprenden. ', flag: '🇪🇸', name: 'Spanish', code: 'spa', confidence: 93 },
      { text: 'Und jede Reise bereichert die, die sie unternehmen. ', flag: '🇩🇪', name: 'German', code: 'deu', confidence: 93 },
      { text: 'E ogni viaggio arricchisce chi lo compie. ', flag: '🇮🇹', name: 'Italian', code: 'ita', confidence: 97 },
    ],
  },
  {
    variants: [
      { text: 'The journey of learning never ends. ', flag: '🇬🇧', name: 'English', code: 'eng', confidence: 91 },
      { text: 'Le voyage de l\'apprentissage ne s\'arrête jamais. ', flag: '🇫🇷', name: 'French', code: 'fra', confidence: 93 },
      { text: 'El viaje del aprendizaje nunca termina. ', flag: '🇪🇸', name: 'Spanish', code: 'spa', confidence: 94 },
      { text: 'Die Reise des Lernens endet nie. ', flag: '🇩🇪', name: 'German', code: 'deu', confidence: 95 },
      { text: 'Il viaggio dell\'apprendimento non finisce mai. ', flag: '🇮🇹', name: 'Italian', code: 'ita', confidence: 94 },
      { text: '学びの旅に終わりはない。', flag: '🇯🇵', name: 'Japanese', code: 'jpn', confidence: 97 },
    ],
  },
]

const isLoading = ref(true)
const feed = ref<FeedResponse | null>(null)

async function loadFeed() {
  try {
    feed.value = await $fetch<FeedResponse>('/api/feed')
  } catch (err) {
    console.error('Failed to load feed', err)
  } finally {
    isLoading.value = false
  }
}

const sentences = computed<MultiLangSentence[]>(() => {
  const f = feed.value

  if (!f || !f.segments || f.segments.length === 0) {
    return FALLBACK_SENTENCES
  }

  const result: MultiLangSentence[] = []

  result.push({
    variants: [
      { text: `${f.date}, ${f.time} — ${f.city}. `, flag: '🏳️', name: 'Locale', code: 'loc', confidence: 100 },
    ],
  })

  for (const seg of f.segments) {
    const variants: SentenceVariant[] = []
    const info = LANG_MAP[seg.lang]
    if (info) {
      variants.push({ text: `${seg.text} `, flag: info.flag, name: info.name, code: info.code, confidence: 100 })
    }

    for (const [tl, text] of Object.entries(seg.translations)) {
      if (!text) continue
      const tInfo = LANG_MAP[tl]
      if (tInfo) {
        variants.push({ text: `${text} `, flag: tInfo.flag, name: tInfo.name, code: tInfo.code, confidence: 97 })
      }
    }

    result.push({ variants })
  }

  return result
})

const activeIndices = ref<number[]>([])

watch(sentences, (s) => {
  activeIndices.value = s.map((sentence, i) => i % sentence.variants.length)
}, { immediate: true })

function activeVariant(sentence: MultiLangSentence, index: number): SentenceVariant {
  const idx = activeIndices.value[index] ?? 0
  return sentence.variants[idx] ?? sentence.variants[0]
}

function cycleLanguage(index: number) {
  if (isTyping.value) return
  const s = sentences.value[index]
  if (!s || s.variants.length <= 1) return
  activeIndices.value[index] = (activeIndices.value[index] + 1) % s.variants.length
  const variant = activeVariant(s, index)
  displayedSentences.value[index] = variant.text
}

const displayedSentences = ref<string[]>([])
const isTyping = ref(true)
const currentTypingIndex = ref(0)

const speed = 12

function startTypewriter() {
  const items = sentences.value
  displayedSentences.value = items.map(() => '')
  if (items.length === 0) {
    isTyping.value = false
    return
  }
  let charIndex = 0
  let currentSentence = 0

  const tick = () => {
    const sentence = items[currentSentence]
    if (!sentence) {
      isTyping.value = false
      return
    }
    currentTypingIndex.value = currentSentence
    const targetText = sentence.variants[activeIndices.value[currentSentence] ?? 0].text
    if (charIndex <= targetText.length) {
      displayedSentences.value[currentSentence] = targetText.slice(0, charIndex)
      charIndex++
      setTimeout(tick, speed)
    } else {
      charIndex = 0
      currentSentence++
      if (currentSentence >= items.length) {
        isTyping.value = false
        return
      }
      setTimeout(tick, speed * 10)
    }
  }
  tick()
}

onMounted(async () => {
  await loadFeed()
  setTimeout(startTypewriter, 300)
})

const features = [
  {
    title: 'Key management',
    description: 'Generate, revoke, and rotate API keys in one place. Built for multi-project usage.',
    icon: 'i-lucide-key-round',
  },
  {
    title: 'Usage controls',
    description: 'Daily limits, usage summaries, and pricing-ready tables for future billing integrations.',
    icon: 'i-lucide-gauge',
  },
  {
    title: 'Workers performance',
    description: 'HTTP-first endpoints optimized for Worker-to-Worker calls and edge latency.',
    icon: 'i-lucide-zap',
  },
]
</script>

<style>
:root {
  --lang-eng: #5B8DEF;
  --lang-spa: #E8A838;
  --lang-fra: #A78BFA;
  --lang-deu: #34D399;
  --lang-ita: #F472B6;
  --lang-jpn: #22D3EE;
  --lang-loc: #9CA3AF;
}
.dark {
  --lang-eng: #93C5FD;
  --lang-spa: #FCD34D;
  --lang-fra: #C4B5FD;
  --lang-deu: #6EE7B7;
  --lang-ita: #F9A8D4;
  --lang-jpn: #67E8F9;
  --lang-loc: #9CA3AF;
}
</style>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-fill-bar {
  animation: fillBar 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-cursor {
  animation: blink 0.8s step-end infinite;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fillBar {
  from { width: 0; }
  to { width: var(--target-width); }
}
@keyframes blink {
  50% { opacity: 0; }
}
</style>
