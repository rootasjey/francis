<template>
  <section class="space-y-12 border-x dark:border-gray-800 max-w-4xl mx-auto py-12">
    <div class="px-6 md:px-12 space-y-4 mt-16">
      <div class="flex items-center gap-3 -mb-4">
        <h1 class="font-sans text-4xl md:text-6xl font-bold tracking-tight">
          About
        </h1>
      </div>
      <p class="max-w-2xl text-base leading-relaxed text-muted-foreground">
        The person behind Francis.
      </p>
    </div>

    <div class="px-6 md:px-12 space-y-4">
      <p class="text-base leading-relaxed">
        Hi, I'm <strong><a href="https://corpinot.cc" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">Jérémie CORPINOT</a></strong>, a French developer based in Yvelines (78), France.
      </p>
      <p class="text-base leading-relaxed text-muted-foreground">
        I like building things around knowledge and art. Francis started because <a href="https://verbatims.cc/about" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">Verbatims</a>, a quote platform I made, needed fast language detection. So I built it.
      </p>
      <p class="text-base leading-relaxed text-muted-foreground">
        I also run <a href="https://zimablue.cc" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">Zima Blue</a>, a virtual gallery where I post digital illustrations made on iPad with Procreate. My day-to-day work is shared between the technical side and the creative outlet.
      </p>
      <p class="text-base leading-relaxed text-muted-foreground">
        You can find my open-source stuff on <a href="https://github.com/rootasjey" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">GitHub</a>.
      </p>
    </div>

    <div class="px-6 md:px-12 space-y-4">
      <h2 class="text-2xl font-bold tracking-tight">Projects</h2>
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
            <p class="text-sm font-semibold group-hover:text-accent transition-colors">{{ project.name }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">{{ project.description }}</p>
          </div>
          <span class="i-lucide-arrow-up-right text-sm text-muted-foreground/50 group-hover:text-accent transition-colors shrink-0" />
        </a>
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
