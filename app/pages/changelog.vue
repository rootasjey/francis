<template>
  <section class="space-y-12 border-x dark:border-gray-800 max-w-4xl mx-auto py-12">
    <div class="px-6 md:px-12 space-y-4 mt-6">
      <div class="flex items-center gap-3">
        <h1 class="font-serif text-4xl md:text-6xl font-bold tracking-tight">
          Changelog
        </h1>
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-400/10">
          <span class="i-lucide-milestone text-sm text-purple-400" />
        </div>
      </div>
      <p class="max-w-2xl text-base leading-relaxed text-muted-foreground">
        All notable changes to Francis. This project follows <a href="https://semver.org" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">semantic versioning</a>.
      </p>
    </div>

    <div class="px-6 md:px-12">
      <div class="relative">
        <div class="absolute left-[7px] top-2 bottom-2 w-px bg-border dark:bg-gray-800" />

        <div v-for="(release, i) in releases" :key="release.version" class="relative pl-8 pb-12 last:pb-0">
          <div class="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2"
            :class="i === 0
              ? 'border-accent bg-accent/20'
              : 'border-border dark:border-gray-700 bg-background'"
          />

          <div class="space-y-3">
            <div class="flex items-baseline gap-3">
              <h2 class="text-lg font-bold tracking-tight">
                <span class="text-accent" :class="i > 0 && 'text-muted-foreground'">v{{ release.version }}</span>
              </h2>
              <time class="font-mono text-xs text-muted-foreground/50">{{ release.date }}</time>
              <span v-if="i === 0" class="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">latest</span>
            </div>

            <div class="space-y-2">
              <div v-for="group in release.groups" :key="group.label" class="flex gap-2">
                <span class="shrink-0 mt-0.5 font-mono text-[10px] font-bold uppercase tracking-wider" :class="group.labelClass">{{ group.label }}</span>
                <div class="space-y-1">
                  <p v-for="item in group.items" :key="item" class="text-sm leading-relaxed text-muted-foreground">
                    {{ item }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="px-6 md:px-12 border-t border-border dark:border-gray-800 pt-8">
      <div class="rounded-2 border border-border dark:border-gray-800 bg-muted/30 p-6 flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold">Follow development</p>
          <p class="text-xs text-muted-foreground mt-0.5">Francis is open source on GitHub.</p>
        </div>
        <a
          href="https://github.com/anomalyco/francis"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2 text-sm font-semibold text-background transition-all duration-200 hover:brightness-110"
        >
          <span class="i-lucide-github text-sm" />
          GitHub
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Release } from '~~/shared/types/changelog'

const { data: releases } = await useFetch<Release[]>('/api/changelog')
</script>
