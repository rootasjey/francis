<template>
  <section class="space-y-12 border-x dark:border-gray-800 max-w-5xl mx-auto py-12">
    <div class="px-6 md:px-12 space-y-4 mt-6">
      <h1 class="font-serif text-3xl md:text-6xl font-bold tracking-tight">
        Simple, usage-based pricing
      </h1>
      <p class="max-w-lg text-md leading-relaxed text-muted-foreground">
        Pay only for what you use. Every plan includes language detection and AI translation.
      </p>
    </div>

    <div class="grid gap-6 px-6 md:px-12 lg:grid-cols-3">
      <div
        v-for="plan in plans"
        :key="plan.name"
        class="rounded-2 border border-border dark:border-gray-800 bg-card p-8 flex flex-col transition-all duration-200 hover:border-primary/30"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{{ plan.name }}</span>
          <span
            v-if="plan.popular"
            class="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-primary tracking-wider uppercase"
          >
            Popular
          </span>
        </div>
        <div class="mt-4">
          <span class="font-sans text-4xl font-bold tracking-tight">${{ plan.price }}</span>
          <span class="font-mono text-sm text-muted-foreground">/month</span>
        </div>
        <p class="mt-2 font-mono text-xs text-muted-foreground">
          {{ plan.included }} requests included
        </p>
        <ul class="mt-8 space-y-3 flex-1">
          <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-3 text-sm">
            <span class="i-lucide-check mt-0.5 text-sm text-emerald-400 shrink-0" />
            {{ feature }}
          </li>
        </ul>
        <NuxtLink
          :to="`/api/polar/checkout?products=${plan.productId}`"
          class="mt-8 block w-full rounded-xl text-center py-3 text-sm font-semibold transition-all duration-200"
          :class="plan.popular
            ? 'bg-foreground text-background hover:brightness-110'
            : 'border border-border bg-background text-foreground hover:bg-muted'"
        >
          {{ plan.cta }}
        </NuxtLink>
      </div>
    </div>

    <div class="px-6 md:px-12 space-y-4 pt-12 border-t border-border dark:border-gray-800">
      <h2 class="text-xl font-semibold tracking-tight">Need more?</h2>
      <p class="text-sm text-muted-foreground">
        Contact us for enterprise pricing, dedicated support, and custom SLAs.
      </p>
      <a
        href="mailto:contact@verbatims.cc"
        class="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted"
      >
        <span class="i-lucide-mail text-sm" />
        Contact sales
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
const plans = [
  {
    name: 'Hobby',
    price: 9,
    included: '5,000',
    productId: 'efb4c1a8-4560-475a-a84f-501f5ec36353',
    cta: 'Start Hobby',
    popular: false,
    features: [
      'Language detection for 400+ languages',
      'AI translation to 100+ languages',
      '5,000 requests per month',
      '€0.002 per additional request',
      'API key management',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: 49,
    included: '50,000',
    productId: '151479c7-30c1-460b-b5fc-5d97cda2f286',
    cta: 'Start Pro',
    popular: true,
    features: [
      'Everything in Hobby',
      '50,000 requests per month',
      '€0.001 per additional request',
      'Higher rate limits',
      'Usage analytics dashboard',
      'Email support',
    ],
  },
  {
    name: 'Enterprise',
    price: 199,
    included: '500,000',
    productId: '806167c7-40cc-447e-a1ad-55da6ff1ea8c',
    cta: 'Start Enterprise',
    popular: false,
    features: [
      'Everything in Pro',
      '500,000 requests per month',
      '€0.0005 per additional request',
      'Priority support',
      'Custom model configurations',
      'SLA guarantee',
    ],
  },
]
</script>
