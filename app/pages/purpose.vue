<template>
  <section class="space-y-12 border-x dark:border-gray-800 max-w-4xl mx-auto py-12">
    <!-- Header -->
    <div class="px-12 space-y-4 mt-24">
      <h1 class="font-sans text-3xl md:text-7xl font-bold tracking-tight">
        Why Francis exists?
      </h1>
      <p class="max-w-lg text-md italic leading-relaxed text-muted-foreground">
        Francis is a language detection API built for the Verbatims platform.
      </p>
    </div>

    <!-- Origin story -->
    <div class="space-y-16 pt-12">
      <div class="p-12 space-y-4 border-t dark:border-gray-800 hover:border-pink-500 transition-[colors] duration-300">
        <h2 class="text-4xl font-400 dark:text-gray-300 tracking-tight">Born from Verbatims</h2>
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
        <h2 class="text-4xl font-400 dark:text-gray-300 tracking-tight">What Francis does</h2>
        <p class="text-sm text-muted-foreground">Language detection, fast and simple</p>
        <p class="pt-4 font-size-6 leading-relaxed">
          Francis exposes a single, straightforward endpoint that accepts text and returns
          the detected language along with a confidence score. It supports 180+ languages,
          responds in milliseconds, and is designed to be integrated directly into the
          Verbatims citation workflow.
        </p>
        <p class="pt-4 font-size-6 leading-relaxed">
          Every request is authenticated via API key, usage is tracked per account, and the
          entire service runs on Cloudflare Workers for low latency worldwide.
        </p>
      </div>

      <div class="p-12 space-y-4 border-t dark:border-gray-800 hover:border-amber-500 transition-[colors] duration-300">
        <h2 class="text-4xl font-400 dark:text-gray-300 tracking-tight">Open source</h2>
        <p class="text-sm text-muted-foreground">Built in the open, for the community</p>
        <p class="pt-4 font-size-6 leading-relaxed">
          Francis is open source and available on GitHub. Contributions, issues, and
          feedback are welcome.
        </p>
      </div>
    </div>
  </section>
</template>
