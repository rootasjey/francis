<template>
  <section class="space-y-12 border-x dark:border-gray-800 max-w-5xl mx-auto py-12">
    <div class="px-6 md:px-12 space-y-4 mt-6">
      <h1 class="font-serif text-4xl md:text-6xl font-bold tracking-tight">
        Supported languages
      </h1>
      <p class="max-w-xl text-base leading-relaxed text-muted-foreground">
        Francis detects all {{ data.total }} languages from
        <a href="https://github.com/wooorm/franc" target="_blank" rel="noopener noreferrer"
          class="underline underline-offset-2 decoration-muted-foreground/30 hover:decoration-foreground transition-colors">franc-all</a>,
        covering {{ scriptCount }} writing systems.
      </p>
    </div>

    <!-- Search + filter -->
    <div class="px-6 md:px-12 space-y-4">
      <NInput v-model="query" type="search" placeholder="Search by language name or code…"
        class="w-full rounded-1 border border-border bg-background px-4 py-2.5 text-sm
          placeholder:text-muted-foreground/40 outline-none
          focus:border-accent/50 focus:ring-1 focus:ring-accent/20
          transition-all duration-200">
        <template #trailing>
          <NButton
            @click="query = ''"
            btn="~"
            icon
            label="i-ph-x"
            size="xs"
            v-if="query.trim().length > 0"
            class="pointer-events-auto cursor-pointer bg-gray-100 dark:bg-gray-800 hover:scale-105 active:scale-99 transition-[transform]"
          />
        </template>
      </NInput>

      <div class="flex flex-wrap gap-2">
        <button v-for="s in scriptFilters" :key="s.id"
          @click="activeScript = s.id"
          class="rounded-full border px-3 py-1.5 text-xs font-500 transition-all duration-200"
          :class="activeScript === s.id
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'">
          <span>{{ s.emoji }}</span>
          <span class="ml-1">{{ s.label }}</span>
          <span class="ml-1 text-[10px] opacity-60">({{ s.count }})</span>
        </button>
      </div>
    </div>

    <!-- Results -->
    <div class="px-6 md:px-12">
      <p class="mb-4 text-xs text-muted-foreground/60">
        Showing {{ filtered.length }} of {{ data.total }} languages
      </p>

      <div v-if="filtered.length === 0" class="py-16 text-center">
        <p class="text-sm text-muted-foreground/50">No languages match your search.</p>
      </div>

      <div v-else class="grid gap-px rounded-1 border border-border dark:border-gray-800 overflow-hidden bg-border dark:bg-gray-800">
        <div v-for="lang in filtered" :key="lang.code"
          class="grid grid-cols-[auto_1fr_auto] items-center bg-gray-100 dark:bg-gray-950 px-4 py-2.5 transition-colors duration-150 hover:bg-accent/5"
          :class="lang.scripts.length > 1 ? 'gap-2 md:gap-6' : 'gap-3'">
          <code class="font-mono text-[11px] text-muted-foreground/60 w-10 shrink-0">{{ lang.code }}</code>
          <span class="text-sm font-500 truncate">{{ lang.name }}</span>
          <div class="flex gap-1.5 justify-end">
            <span v-for="s in lang.scripts" :key="s"
              class="rounded-full border border-border/50 px-2 py-0.5 text-[10px] text-muted-foreground/60 font-500 whitespace-nowrap">
              {{ scriptLabel(s) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer note -->
    <div class="px-6 md:px-12 border-t border-border dark:border-gray-800 pt-8">
      <p class="text-xs text-muted-foreground/40 leading-relaxed">
        Language codes follow <a href="https://iso639-3.sil.org" target="_blank" rel="noopener noreferrer"
          class="underline underline-offset-2 decoration-muted-foreground/20 hover:decoration-foreground/60 transition-colors">ISO 639-3</a>.
        Detection powered by
        <a href="https://github.com/wooorm/franc" target="_blank" rel="noopener noreferrer"
          class="underline underline-offset-2 decoration-muted-foreground/20 hover:decoration-foreground/60 transition-colors">franc-all</a>
        &mdash; open-source trigram-based language detection.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import rawData from '../data/languages.json'

const route = useRoute()
const router = useRouter()

interface Language {
  code: string
  name: string
  scripts: string[]
}

interface Data {
  total: number
  languages: Language[]
}

const data = rawData as Data

const scriptLabels: Record<string, string> = {
  Latin: 'Latin',
  Cyrillic: 'Cyrillic',
  Arabic: 'Arabic',
  Devanagari: 'Devanagari',
  Myanmar: 'Myanmar',
  Ethiopic: 'Ethiopic',
  Tibetan: 'Tibetan',
  Hebrew: 'Hebrew',
  Canadian_Aboriginal: 'Canadian Aboriginal',
  Sinitic: 'Chinese',
  Japanese: 'Japanese',
  Bengali: 'Bengali',
  Gujarati: 'Gujarati',
  Malayalam: 'Malayalam',
  Kannada: 'Kannada',
  Thai: 'Thai',
  Khmer: 'Khmer',
  Lao: 'Lao',
  Yi: 'Yi',
  Thaana: 'Thaana',
  Syriac: 'Syriac',
  Telugu: 'Telugu',
  Tamil: 'Tamil',
  Gurmukhi: 'Gurmukhi',
  Sinhala: 'Sinhala',
  Georgian: 'Georgian',
  Armenian: 'Armenian',
  Hangul: 'Korean',
  Other: 'Other'
}

const scriptEmojis: Record<string, string> = {
  Latin: '🔤',
  Cyrillic: '🔶',
  Arabic: '🔷',
  Devanagari: '🔴',
  Myanmar: '🟢',
  Ethiopic: '🟠',
  Tibetan: '🟣',
  Hebrew: '🔵',
  Canadian_Aboriginal: '🦆',
  Sinitic: '🀄',
  Japanese: '🗾',
  Bengali: '🟡',
  Gujarati: '🟤',
  Malayalam: '🟢',
  Kannada: '🔶',
  Thai: '🇹🇭',
  Khmer: '🇰🇭',
  Lao: '🇱🇦',
  Yi: '🔷',
  Thaana: '🇲🇻',
  Syriac: '✝️',
  Telugu: '🟠',
  Tamil: '🟡',
  Gurmukhi: '🟤',
  Sinhala: '🇱🇰',
  Georgian: '🇬🇪',
  Armenian: '🇦🇲',
  Hangul: '🇰🇷',
  Other: '❓'
}

function scriptLabel(s: string): string {
  return scriptLabels[s] || s
}

const query = ref((route.query.q as string) || '')
const activeScript = ref(route.query.script as string || 'all')

watch(query, (val) => {
  router.replace({ query: { ...route.query, q: val || undefined } })
})

watch(() => route.query.q, (val) => {
  if (val !== query.value) query.value = val || ''
})

const scriptCount = computed(() => {
  const scripts = new Set<string>()
  for (const lang of data.languages) {
    for (const s of lang.scripts) {
      scripts.add(s)
    }
  }
  return scripts.size
})

const scriptCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const lang of data.languages) {
    for (const s of lang.scripts) {
      counts[s] = (counts[s] || 0) + 1
    }
  }
  return counts
})

const scriptFilters = computed(() => {
  const order = [
    'Latin', 'Cyrillic', 'Arabic', 'Devanagari', 'Myanmar', 'Ethiopic',
    'Tibetan', 'Hebrew', 'Canadian_Aboriginal', 'Sinitic', 'Japanese',
    'Bengali', 'Gujarati', 'Malayalam', 'Kannada', 'Telugu', 'Tamil',
    'Gurmukhi', 'Sinhala', 'Thai', 'Khmer', 'Lao', 'Yi', 'Thaana',
    'Syriac', 'Georgian', 'Armenian', 'Hangul', 'Other'
  ]
  const filters = [{ id: 'all', label: 'All', emoji: '🌐', count: data.total }]
  for (const id of order) {
    if (scriptCounts.value[id]) {
      filters.push({ id, label: scriptLabels[id] || id, emoji: scriptEmojis[id] || '', count: scriptCounts.value[id] })
    }
  }
  return filters
})

const filtered = computed(() => {
  let list = data.languages

  if (activeScript.value !== 'all') {
    list = list.filter(l => l.scripts.includes(activeScript.value))
  }

  const q = query.value.toLowerCase().trim()
  if (q) {
    list = list.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.code.includes(q)
    )
  }

  return list
})
</script>
