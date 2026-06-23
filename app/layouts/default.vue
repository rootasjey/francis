<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <NuxtLink to="/" class="flex items-center gap-2 text-lg font-semibold">
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white">F</span>
          Francis
        </NuxtLink>
        <nav class="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <NuxtLink to="/" class="hover:text-foreground">Home</NuxtLink>
          <NuxtLink to="/dashboard" class="hover:text-foreground">Dashboard</NuxtLink>
          <NuxtLink to="/admin" class="hover:text-foreground">Admin</NuxtLink>
        </nav>
        <div class="flex items-center gap-3">
          <button
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground"
            :title="`Theme: ${colorMode.preference}`"
            @click="cycleTheme"
          >
            <span v-if="colorMode.preference === 'light'" class="i-lucide-sun text-sm" />
            <span v-else-if="colorMode.preference === 'dark'" class="i-lucide-moon text-sm" />
            <span v-else class="i-lucide-monitor text-sm" />
          </button>
          <NuxtLink
            v-if="!session.loggedIn.value"
            to="/login"
            class="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Sign in
          </NuxtLink>
          <NuxtLink
            v-else
            to="/dashboard"
            class="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Open Console
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl px-6 py-12">
      <slot />
    </main>

    <footer class="border-t border-border py-10">
      <div class="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
        <p>Francis API &bull; Language detection for Verbatims</p>
        <p>francis.verbatims.cc</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useUserSession } from '#imports'

const session = useUserSession()
const colorMode = useColorMode()

const themes = ['light', 'dark', 'system'] as const

function cycleTheme() {
  const idx = themes.indexOf(colorMode.preference as typeof themes[number])
  colorMode.preference = themes[(idx + 1) % themes.length]
}
</script>
