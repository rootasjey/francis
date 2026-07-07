<template>
  <section class="space-y-24 border-x dark:border-gray-800 max-w-6xl mx-auto py-12">
    <!-- Hero -->
    <div class="relative max-w-5xl mx-auto">
      <!-- Background glow -->
      <div class="absolute -inset-x-20 -top-20 -bottom-12 -z-10 rounded-[5rem] bg-gradient-to-b from-accent/[0.05] via-accent/[0.02] to-transparent blur-3xl" aria-hidden="true" />

      <!-- Headline -->
      <h1 class="max-w-4xl italic font-serif text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-[5rem]">
        Detect <span class="text-accent dark:text-amber">language</span> in <span class="group relative inline-block"><span class="relative z-10">milliseconds</span><span class="absolute right-0 top-0 translate-x-2 -translate-y-1.5 opacity-0 group-hover:opacity-50 dark:group-hover:opacity-60 group-hover:block transition-all duration-500 delay-75 pointer-events-none select-none"><span class="text-blue-500">milliseconds</span></span><span class="absolute right-0 top-0 translate-x-3.5 opacity-0 group-hover:opacity-40 dark:group-hover:opacity-50 transition-all duration-500 delay-150 pointer-events-none select-none"><span class="text-rose-400">milliseconds</span></span><span class="absolute right-0 top-0 translate-x-5 -translate-y-1 opacity-0 group-hover:opacity-30 dark:group-hover:opacity-40 transition-all duration-500 delay-225 pointer-events-none select-none"><span class="text-accent">milliseconds</span></span></span>. <span class="inline-flex font-sans items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 align-middle text-base md:text-xl font-semibold text-accent tracking-normal leading-none -mt-1">The edge-native API</span>
      </h1>

      <!-- Subtitle -->
      <p class="max-w-2xl text-lg font-500 leading-relaxed text-muted-foreground">
        Francis brings franc-all to Cloudflare Workers. Ship language detection
        in milliseconds with API keys, usage tracking, and a modern console.
      </p>

      <!-- Product showcase -->
      <div class="mt-8 animate-slide-up p-8 md:p-12 lg:p-16 max-w-5xl mx-auto
        overflow-hidden rounded-2 border border-border dark:border-gray-800
        hover:border-primary
        bg-transparent dark:bg-gray-950 shadow-md hover:shadow-lg
        transition-[shadow,colors]">
      <!-- Meta line -->
      <div v-if="feed" class="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border dark:border-gray-800 pb-4 font-mono text-[11px] text-muted-foreground/60">
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
        <div class="h-5 w-3/4 animate-pulse rounded bg-muted dark:bg-gray-700" />
        <div class="h-5 w-2/3 animate-pulse rounded bg-muted dark:bg-gray-700" />
        <div class="h-5 w-1/2 animate-pulse rounded bg-muted dark:bg-gray-700" />
        <div class="h-5 w-3/5 animate-pulse rounded bg-muted dark:bg-gray-700" />
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
          <span class="invisible absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-2 border border-border dark:border-gray-800 bg-card p-2 text-xs shadow-lg opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 z-10">
            <span class="flex items-center gap-2">
              <span class="text-base leading-none">{{ activeVariant(sentence, i).flag }}</span>
              <span class="font-medium text-foreground/90">{{ activeVariant(sentence, i).name }}</span>
              <span class="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{{ activeVariant(sentence, i).code }}</span>
              <span class="font-mono text-[10px] text-muted-foreground/50">{{ activeVariant(sentence, i).confidence }}%</span>
            </span>
          </span>
        </span>
      </p>

      <div class="mt-10 flex items-center justify-between border-t border-border dark:border-gray-900 pt-6">
        <p class="text-sm text-muted-foreground/50">Multilingual text &middot; {{ sentences.length }} sentences &middot; {{ sentences.length }} languages</p>
        <div class="flex items-center gap-2 text-sm text-muted-foreground/40">
          <span class="i-lucide-mouse-pointer-2 h-3 w-3" />
          <span class="text-sm text-muted-foreground/50">Click any sentence to switch its language</span>
        </div>
      </div>
        </div>
    </div>

    <!-- Features -->
    <div class="space-y-12 max-w-5xl mx-auto">
      <div class="max-w-2xl">
        <h2 class="font-serif text-4xl font-400 tracking-tight md:text-5xl">
          Built for developers.<br/>
          <span class="text-accent">Deployed</span> on the edge.
        </h2>
        <p class="mt-2 text-base leading-relaxed text-muted-foreground">
          Every feature is designed to make language detection fast, private, and painless to integrate.
        </p>
      </div>

      <div class="space-y-8">
        <div
          v-for="(feature, i) in features"
          :key="feature.title"
          class="group grid md:grid-cols-[5rem_3rem_1fr] items-start gap-4 md:gap-0"
        >
          <span class="hidden font-mono text-4xl font-bold tracking-tight text-foreground/5 dark:text-foreground/45 transition-colors duration-300 md:block md:text-right"
            :class="[{
              'group-hover:text-blue/65': feature.number === 1,
              'group-hover:text-red/65': feature.number === 2,
              'group-hover:text-yellow/65': feature.number === 3,
            }]">
            {{ String(feature.number).padStart(2, '0') }}
          </span>
          <div class="hidden md:flex justify-center h-full pt-3">
            <div class="w-px h-16 bg-gradient-to-b from-border to-transparent transition-colors duration-300"
              :class="[{
                'group-hover:from-blue/40': feature.number === 1,
                'group-hover:from-red/40': feature.number === 2,
                'group-hover:from-yellow/40': feature.number === 3,
              }]">
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted transition-colors duration-300"
                :class="[{
                  'group-hover:bg-blue/10': feature.number === 1,
                  'group-hover:bg-red/10': feature.number === 2,
                  'group-hover:bg-yellow/10': feature.number === 3,
                }]">
                <span :class="[feature.icon, {
                  'group-hover:text-blue': feature.number === 1,
                  'group-hover:text-red': feature.number === 2,
                  'group-hover:text-yellow': feature.number === 3,
                  }]">
                </span>
              </span>
              <h3 class="text-2xl font-600 font-mono tracking-tight">{{ feature.title }}</h3>
            </div>
            <p class="max-w-lg text-sm leading-relaxed text-muted-foreground">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- API Quickstart -->
    <div id="api" class="border-y border-gray-300 dark:border-gray-800">
      <div class="py-16 max-w-5xl mx-auto flex justify-between gap-8">
        <div class="max-w-5xl mx-auto">
          <div class="max-w-2xl flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h2 class="font-serif text-5xl font-400 tracking-tight">API quickstart</h2>
              <p class="mt-1 text-sm text-muted-foreground">One endpoint, one header, any language.</p>
            </div>
          </div>

          <!-- Compact inline demo -->
          <div class="rounded-1 max-w-2xl border border-border dark:border-gray-800 bg-gray-200 dark:bg-gray-950 overflow-hidden">
            <div class="flex items-center gap-3 px-4 py-3 border-b border-border dark:border-gray-800">
              <span class="text-xs text-muted-foreground">Terminal</span>
              <span class="ml-auto font-mono text-[10px] text-muted-foreground/60">bash</span>
            </div>
            <div class="px-4 py-4 font-mono text-xs leading-loose">
              <div class="flex items-start gap-2 opacity-70">
                <span class="text-muted-foreground/30 shrink-0">$</span>
                <div>
                  <span class="text-muted-foreground/90  dark:text-foreground">curl -X POST</span>
                  <span class="text-blue-500">'https://francis.verbatims.cc/api/v1/detect'</span>
                  <span class="text-muted-foreground/90 dark:text-foreground">\</span><br/>
                  <span class="text-muted-foreground/90 dark:text-foreground">&nbsp;&nbsp;-H</span>
                  <span class="text-accent">'x-api-key: fcs_****'</span>
                  <span class="text-muted-foreground/90 dark:text-foreground">\</span><br/>
                  <span class="text-muted-foreground/90 dark:text-foreground">&nbsp;&nbsp;-d</span>
                  <span class="text-emerald-600 dark:text-emerald-400">'{"text": "Hello world"}'</span>
                </div>
              </div>
              <div class="mt-3 flex items-start gap-2">
                <span class="text-emerald-500 shrink-0">&rarr;</span>
                <div class="rounded-md bg-foreground dark:bg-gray-900 px-3 py-2 w-full">
                  <span class="text-background/40 dark:text-foreground">{ </span><span class="text-background/60 dark:text-foreground">"language"</span><span class="text-background/40">: </span><span class="text-emerald-400">"eng"</span><span class="text-background/40 dark:text-foreground">, </span><span class="text-background/60 dark:text-foreground">"confidence"</span><span class="text-background/40 dark:text-foreground">: </span><span class="text-background/80 dark:text-foreground">0.97</span><span class="text-background/40 dark:text-foreground">, </span><span class="text-background/60 dark:text-foreground">"alternatives"</span><span class="text-background/40 dark:text-foreground">: [</span><span class="text-background/60 dark:text-foreground">"spa"</span><span class="text-background/40 dark:text-foreground">, </span><span class="text-background/60 dark:text-foreground">"fra"</span><span class="text-background/40 dark:text-foreground">] }</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 mb-6 max-w-2xl flex flex-wrap justify-center gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] font-600 text-muted-foreground">
              <span class="i-lucide-globe h-3 w-3" />
              400+ languages
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] font-600 text-muted-foreground">
              <span class="i-lucide-book-open h-3 w-3" />
              ISO 639-3
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] font-600 text-muted-foreground">
              <span class="i-lucide-zap h-3 w-3" />
              Edge native
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] font-600 text-muted-foreground">
              <span class="i-lucide-key h-3 w-3" />
              API key auth
            </span>
          </div>
        </div>

        <div class="max-w-sm mx-auto">
          <div class="ml-8">
            <h3 class="text-wrap font-sans text-8xl font-600 text-orange-300 tracking-tight">Start today for free</h3>
            <p class="text-sm text-muted-foreground/60 mt-2">No credit card required</p>
            <NLink to="/signup" class="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-gray-300 px-3 py-1.5 text-[12px] font-600 text-muted-foreground hover:bg-gray-400 hover:scale-104 active:bg-gray-50 active:scale-99 transition-[transform]">
              Get started
              <span class="i-lucide-arrow-right h-3 w-3" />
            </NLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Language grid -->
    <div class="max-w-5xl mx-auto space-y-4">
      <div class="max-w-5xl mx-auto px-8 flex items-center justify-between">
        <NuxtLink to="/languages" class="text-xs text-muted-foreground/60 hover:text-foreground transition-colors">Supported languages <span class="font-semibold text-foreground/80">400+</span></NuxtLink>
        <p class="text-[10px] text-muted-foreground/40">ISO 639-3 codes</p>
      </div>
      <div class="flex flex-wrap justify-center gap-2">
        <NuxtLink v-for="lang in languages" :key="lang.code"
          :to="`/languages?q=${lang.code}`"
          class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background dark:bg-gray-950 px-2.5 py-1.5 text-[11px] text-foreground/80 transition-colors duration-200 hover:border-accent/30 hover:bg-accent/5 hover:text-accent">
          <span class="text-sm leading-none">{{ lang.flag }}</span>
          <span class="font-medium">{{ lang.code }}</span>
          <span class="text-muted-foreground/50">·</span>
          <span class="text-muted-foreground/70">{{ lang.name }}</span>
        </NuxtLink>
        <NuxtLink to="/languages"
          class="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-transparent px-2.5 py-1.5 text-[11px] text-muted-foreground/50 hover:text-foreground hover:border-foreground/30 transition-colors duration-200">
          See all →
        </NuxtLink>
      </div>
    </div>

    <!-- Stats -->
    <div class="max-w-5xl mx-auto grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border dark:bg-gray-800">
      <div class="bg-muted/50 p-6 md:p-8">
        <NuxtLink to="/languages" class="font-serif text-3xl font-bold tracking-tight md:text-4xl">400+</NuxtLink>
        <NuxtLink to="/languages" class="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors block">Languages supported</NuxtLink>
      </div>
      <div class="bg-muted/50 p-6 md:p-8">
        <p class="font-serif text-3xl font-bold tracking-tight md:text-4xl">&lt;50ms</p>
        <p class="mt-1 text-xs text-muted-foreground">Average response time</p>
      </div>
      <div class="bg-muted/50 p-6 md:p-8">
        <p class="font-serif text-3xl font-bold tracking-tight md:text-4xl">0</p>
        <p class="mt-1 text-xs text-muted-foreground">Data retention</p>
      </div>
    </div>

    <!-- CTA -->
    <div class="max-w-5xl mx-auto rounded-2 bg-foreground dark:bg-gray-950 p-8 md:p-12">
      <div class="max-w-xl mx-auto text-center space-y-6">
        <h2 class="font-serif text-3xl font-bold tracking-tight text-background dark:text-white md:text-4xl">
          Start detecting language<br/>
          in <span class="text-accent">milliseconds</span>.
        </h2>
        <p class="text-sm text-background/60 dark:text-white/60 leading-relaxed">
          Get a free API key and integrate language detection into your app in minutes.
          No credit card required.
        </p>
        <NuxtLink
          to="/dashboard"
          class="inline-flex items-center gap-2 rounded-xl bg-background
            px-7 py-3.5 font-semibold text-foreground
            dark:bg-gray-900 hover:dark:bg-gray-800 active:dark:bg-gray-800
            hover:scale-105 active:scale-99
            transition-all duration-200 hover:brightness-90"
        >
          Get Started
          <span class="i-lucide-arrow-right text-sm" />
        </NuxtLink>
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
  ja: { flag: '🇯🇵', name: 'Japanese', code: 'jpn' },
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

const languages = [
  { flag: '🇬🇧', code: 'eng', name: 'English' },
  { flag: '🇫🇷', code: 'fra', name: 'French' },
  { flag: '🇪🇸', code: 'spa', name: 'Spanish' },
  { flag: '🇩🇪', code: 'deu', name: 'German' },
  { flag: '🇮🇹', code: 'ita', name: 'Italian' },
  { flag: '🇵🇹', code: 'por', name: 'Portuguese' },
  { flag: '🇷🇺', code: 'rus', name: 'Russian' },
  { flag: '🇯🇵', code: 'jpn', name: 'Japanese' },
  { flag: '🇨🇳', code: 'cmn', name: 'Mandarin' },
  { flag: '🇰🇷', code: 'kor', name: 'Korean' },
  { flag: '🇦🇪', code: 'ara', name: 'Arabic' },
  { flag: '🇮🇳', code: 'hin', name: 'Hindi' },
  { flag: '🇳🇱', code: 'nld', name: 'Dutch' },
  { flag: '🇸🇪', code: 'swe', name: 'Swedish' },
  { flag: '🇵🇱', code: 'pol', name: 'Polish' },
  { flag: '🇹🇷', code: 'tur', name: 'Turkish' },
  { flag: '🇻🇳', code: 'vie', name: 'Vietnamese' },
  { flag: '🇹🇭', code: 'tha', name: 'Thai' },
  { flag: '🇮🇩', code: 'ind', name: 'Indonesian' },
  { flag: '🇬🇷', code: 'ell', name: 'Greek' },
]

const features = [
  {
    title: 'Key management',
    description: 'Generate, revoke, and rotate API keys in one place. Built for multi-project usage.',
    icon: 'i-lucide-key-round',
    number: 1,
  },
  {
    title: 'Usage controls',
    description: 'Daily limits, usage summaries, and pricing-ready tables for future billing integrations.',
    icon: 'i-lucide-gauge',
    number: 2,
  },
  {
    title: 'Workers performance',
    description: 'HTTP-first endpoints optimized for Worker-to-Worker calls and edge latency.',
    icon: 'i-lucide-zap',
    number: 3,
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
