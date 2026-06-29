<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="sticky top-0 z-20 border-b border-border dark:border-white/10 bg-background/80 backdrop-blur">
      <div class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <div class="flex items-center gap-7">
          <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
            <img src="/images/potato.png" alt="Francis" class="h-7 w-7" />
            Francis
          </NuxtLink>
          <nav class="hidden md:block">
            <NNavigationMenu
              :items="navItems"
              size="sm"
              class="flex-initial"
              navigation-menu="ghost-white"
              navigation-menu-link="ghost-white"
              :una="{
                navigationMenuTrigger: 'hover:bg-[#6B7280]/15',
                navigationMenuLink: 'hover:bg-[#6B7280]/15',
                navigationMenuContentItem: 'hover:bg-[#6B7280]/15',
              }"
            />
          </nav>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink
            v-if="!session.loggedIn.value"
            to="/login"
            class="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted"
          >
            Sign in
          </NuxtLink>
          <NuxtLink
            v-else
            to="/dashboard"
            class="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted"
          >
            Console
          </NuxtLink>
          <NuxtLink
            to="/dashboard"
            class="rounded-xl bg-foreground px-5 py-2 text-sm font-semibold text-background transition-all duration-200 hover:brightness-110"
          >
            Get Started
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full">
      <slot />
    </main>

    <footer class="border-t border-border dark:border-gray-800 py-10">
      <div class="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
        <div class="flex items-center gap-4">
          <NuxtLink to="/status" class="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground">Status</NuxtLink>
          <div class="w-px h-4 bg-muted-foreground/30 hover:bg-blue/50"></div>
          <span class="font-500">Francis API</span> <span>&bull;</span> <span class="font-500">Language detection</span>
          <div class="relative flex items-center">
            <span v-if="colorMode.preference === 'light'" class="absolute left-2 pointer-events-none i-lucide-sun text-xs text-muted-foreground" />
            <span v-else-if="colorMode.preference === 'dark'" class="absolute left-2 pointer-events-none i-lucide-moon text-xs text-muted-foreground" />
            <span v-else class="absolute left-2 pointer-events-none i-lucide-monitor text-xs text-muted-foreground" />
            <select
              :value="colorMode.preference"
              class="appearance-none bg-transparent pl-7 pr-5 py-1 text-xs text-muted-foreground cursor-pointer transition-colors hover:text-foreground focus:outline-none"
              @change="colorMode.preference = ($event.target as HTMLSelectElement).value as 'light' | 'dark' | 'system'"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
            <span class="absolute right-1 pointer-events-none i-lucide-chevron-down text-[10px] text-muted-foreground" />
          </div>
        </div>
        <p class="font-mono text-xs">francis.verbatims.cc</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useUserSession } from '#imports'

const session = useUserSession()
const colorMode = useColorMode()

const navItems = [
  {
    label: 'Features',
    items: [
      {
        label: 'Key Management',
        description: 'Generate, revoke, and rotate API keys in one place.',
        to: '#features',
      },
      {
        label: 'Usage Controls',
        description: 'Daily limits, usage summaries, and billing-ready tables.',
        to: '#features',
      },
      {
        label: 'Workers Performance',
        description: 'HTTP-first endpoints optimized for edge latency.',
        to: '#features',
      },
      {
        label: 'Language Detection',
        description: '180+ languages detected in milliseconds.',
        to: '#features',
      },
    ],
  },
  {
    label: 'Documentation',
    items: [
      {
        label: 'Quickstart',
        description: 'Get up and running in minutes.',
        to: '#api',
      },
      {
        label: 'API Reference',
        description: 'Complete endpoint documentation.',
        to: '#api',
      },
      {
        label: 'Changelog',
        description: 'Latest updates and releases.',
        to: '#',
      },
    ],
  },
  { label: 'Pricing', to: '#' },
  { label: 'Purpose', to: '/purpose' },
  { label: 'Company', to: '#' },
]
</script>
