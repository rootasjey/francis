<template>
  <section class="relative mx-auto max-w-5xl overflow-hidden border-x border-border dark:border-gray-800 py-12">
    <div class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />

    <div class="relative space-y-16 px-6 md:px-12">
      <header class="mt-6 max-w-3xl space-y-5">
        <p class="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-accent">Francis / Contact</p>
        <h1 class="max-w-2xl font-serif text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
          Let's talk about language.
        </h1>
        <p class="max-w-xl text-lg leading-relaxed text-muted-foreground">
          Questions about the API, ideas for improving Francis, or a project worth building together?
          The inbox is open.
        </p>
      </header>

      <div class="grid gap-6 md:grid-cols-[1.35fr_1fr]">
        <a
          href="mailto:francis@verbatims.cc"
          class="group rounded-2 border-2 border-foreground/10 bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-xl md:p-10"
        >
          <div class="flex items-start justify-between gap-6">
            <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <span class="i-lucide-mail text-lg" />
            </span>
            <span class="i-lucide-arrow-up-right text-muted-foreground/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent" />
          </div>
          <p class="mt-12 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">General contact</p>
          <p class="mt-3 break-all font-mono text-xl font-semibold tracking-tight text-foreground md:text-2xl">francis@verbatims.cc</p>
          <p class="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">For support, partnerships, feedback, and everything in between.</p>
        </a>

        <div class="grid gap-6">
          <NuxtLink to="/docs/quickstart" class="group rounded-2 border border-border bg-muted/30 p-7 transition-colors duration-300 hover:border-primary/40 hover:bg-muted/60">
            <div class="flex items-center justify-between">
              <span class="i-lucide-book-open text-primary" />
              <span class="i-lucide-arrow-up-right text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <p class="mt-8 font-semibold">Read the docs</p>
            <p class="mt-1 text-sm leading-relaxed text-muted-foreground">Find the endpoint reference and start integrating.</p>
          </NuxtLink>

          <NuxtLink to="/status" class="group rounded-2 border border-border bg-muted/30 p-7 transition-colors duration-300 hover:border-emerald-400/40 hover:bg-muted/60">
            <div class="flex items-center justify-between">
              <span class="i-lucide-activity text-emerald-500" />
              <span class="i-lucide-arrow-up-right text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <p class="mt-8 font-semibold">Check system status</p>
            <p class="mt-1 text-sm leading-relaxed text-muted-foreground">See the current health of the Francis service.</p>
          </NuxtLink>
        </div>
      </div>

      <div class="border-t border-border pt-8 text-sm text-muted-foreground">
        <p>
          Francis is an open-source project built for Verbatims.
          <a href="https://github.com/rootasjey/francis" target="_blank" rel="noopener noreferrer" class="ml-1 font-medium text-foreground hover:text-accent hover:underline">View the source on GitHub</a>.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
useHead({
  title: 'Contact · Francis',
  meta: [
    { name: 'description', content: 'Contact the Francis language detection API team.' },
  ],
})
</script>
