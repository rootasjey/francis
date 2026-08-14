<template>
  <div class="overflow-hidden rounded-2 border border-border dark:border-gray-800 bg-gray-200 dark:bg-gray-950">
    <div v-if="label" class="flex items-center gap-3 border-b border-border dark:border-gray-800 px-4 py-3">
      <span class="text-xs text-muted-foreground/60">{{ label }}</span>
      <span class="ml-auto font-mono text-[10px] text-muted-foreground/50">{{ language }}</span>
    </div>
    <div v-if="highlightedHtml" class="code-block overflow-x-auto text-xs leading-loose" v-html="highlightedHtml" />
    <pre v-else class="overflow-x-auto px-4 py-3 font-mono text-xs leading-loose"><code>{{ code }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import type { HighlighterCore } from 'shiki'

const props = withDefaults(defineProps<{
  code: string
  language?: string
  label?: string
}>(), {
  language: 'text',
  label: '',
})

const colorMode = useColorMode()
const highlightedHtml = ref('')
let highlighterPromise: Promise<HighlighterCore> | undefined

function getHighlighter() {
  highlighterPromise ??= Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
    import('shiki/langs/bash'),
    import('shiki/langs/http'),
    import('shiki/langs/javascript'),
    import('shiki/langs/json'),
    import('shiki/langs/python'),
    import('shiki/themes/github-dark'),
    import('shiki/themes/github-light'),
  ]).then(([core, engine, bash, http, javascript, json, python, dark, light]) => core.createHighlighterCore({
    engine: engine.createJavaScriptRegexEngine(),
    themes: [dark.default, light.default],
    langs: [bash.default, http.default, javascript.default, json.default, python.default],
  }))
  return highlighterPromise
}

async function highlight() {
  if (!import.meta.client) return

  const highlighter = await getHighlighter()
  highlightedHtml.value = highlighter.codeToHtml(props.code, {
    lang: props.language,
    theme: colorMode.value === 'dark' ? 'github-dark' : 'github-light',
  })
}

onMounted(highlight)
watch(() => props.code, highlight)
watch(() => colorMode.value, highlight)
</script>

<style scoped>
.code-block :deep(pre) {
  margin: 0;
  min-width: max-content;
  padding: 0.75rem 1rem;
}
</style>
