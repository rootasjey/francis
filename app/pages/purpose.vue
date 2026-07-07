<template>
  <section class="space-y-12 border-x dark:border-gray-800 max-w-5xl mx-auto py-12">
    <!-- Header -->
    <div class="px-12 mt-6">
      <h1 class="font-serif text-3xl md:text-7xl font-bold tracking-tight">
        Why Francis exists?
      </h1>
      <p class="ml-4 max-w-lg text-md leading-relaxed text-muted-foreground">
        Francis is a language detection API built for the Verbatims platform.
      </p>
    </div>

    <!-- Origin story -->
    <div class="space-y-16 pt-12">
      <div class="p-12 space-y-4 border-t dark:border-gray-800 hover:border-pink-500 transition-[colors] duration-300">
        <h2 class="text-4xl font-600 font-serif dark:text-gray-300 tracking-tight line-height-4">Born from Verbatims</h2>
        <p class="text-sm text-muted-foreground">A platform for discovering and sharing quotes</p>
        <p class="pt-4 font-size-6 leading-relaxed">
          Verbatims is a quote platform where users discover, curate, and share memorable
          quotes from films, books, music, and more. Quotes on Verbatims come from all over
          the world and span many languages — French, English, Spanish, Arabic, and beyond.
        </p>
        <p class="font-size-6 leading-relaxed">
          To attribute quotes accurately and enrich the browsing experience, the platform
          needed a fast, reliable way to detect what language each quote was written in.
          That's where Francis comes in.
        </p>
      </div>

      <div class="p-12 space-y-4 border-t dark:border-gray-800 hover:border-blue-500 transition-[colors] duration-300">
        <h2 class="text-4xl font-600 font-serif dark:text-gray-300 tracking-tight line-height-4">What Francis does</h2>
        <p class="text-sm text-muted-foreground">Language detection, fast and simple</p>
        <p class="pt-4 font-size-6 leading-relaxed">
          Francis exposes a single, straightforward endpoint that accepts text and returns
          the detected language along with a confidence score. It supports 400+ languages,
          responds in milliseconds, and is designed to be integrated directly into the
          Verbatims citation workflow.
        </p>
        <p class="pt-4 font-size-6 leading-relaxed">
          Every request is authenticated via API key, usage is tracked per account, and the
          entire service runs on Cloudflare Workers for low latency worldwide.
        </p>
      </div>

      <div class="p-12 space-y-4 border-t dark:border-gray-800 hover:border-amber-500 transition-[colors] duration-300">
        <h2 class="text-4xl font-600 font-serif dark:text-gray-300 tracking-tight line-height-4">Open source</h2>
        <p class="text-sm text-muted-foreground">Built in the open, for the community</p>
        <p class="pt-4 font-size-6 leading-relaxed">
          Francis is open source and available on GitHub. Contributions, issues, and
          feedback are welcome.
        </p>
      </div>

      <div class="p-12 space-y-4 border-t dark:border-gray-800 hover:border-green-500 transition-[colors] duration-300">
        <h2 class="text-4xl font-600 font-serif dark:text-gray-300 tracking-tight line-height-4">Who is behind Francis?</h2>
        <p class="text-sm text-muted-foreground">It's me!</p>
        <p class="pt-4 font-size-6 leading-relaxed">
          Hi, I'm <a href="https://corpinot.cc" target="_blank" rel="noopener noreferrer" class="italic hover:underline">Jérémie CORPINOT</a>, a French developer based in Versailles (78), France.
        </p>
        <p class="font-size-6 leading-relaxed">
          I like building things around knowledge and art. Francis started because <a href="https://verbatims.cc" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">Verbatims</a> needed fast language detection.
        </p>
      </div>

      <div class="p-12 space-y-4 border-t dark:border-gray-800 hover:border-green-500 transition-[colors] duration-300">
        <h2 class="text-4xl font-600 font-serif dark:text-gray-300 tracking-tight line-height-4">Other projects</h2>
        <p class="text-sm text-muted-foreground">Take a look at some of my other projects.</p>

        <div class="max-w-prose space-y-4">
          <div class="grid gap-4">
            <a
              v-for="project in projects"
              :key="project.name"
              :href="project.url"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-2 border border-border dark:border-gray-800 bg-gray-100 dark:bg-gray-950 p-5 flex items-center justify-between transition-all duration-200 hover:border-accent/30 hover:bg-accent/5 group"
            >
              <div>
                <p class="text-lg font-500 group-hover:text-accent transition-colors">{{ project.name }}</p>
                <p class="text-sm text-muted-foreground mt-0.5">{{ project.description }}</p>
              </div>
              <span class="i-tabler-arrow-up-right text-sm text-muted-foreground/50 group-hover:text-accent transition-colors shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const projects = [
  {
    name: 'Verbatims',
    description: 'A platform for discovering and sharing quotes across languages and cultures.',
    url: 'https://verbatims.cc',
  },
  {
    name: 'Zima Blue',
    description: 'A virtual gallery of digital illustrations made on iPad with Procreate.',
    url: 'https://zimablue.cc',
  },
  {
    name: 'corpinot.cc',
    description: 'My personal website and portfolio.',
    url: 'https://corpinot.cc',
  },
  {
    name: 'GitHub',
    description: 'Open-source code, contributions, and side projects.',
    url: 'https://github.com/rootasjey',
  },
]
</script>
