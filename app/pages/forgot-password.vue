<template>
  <section class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-24">
    <div class="w-full max-w-md space-y-8">
      <div class="space-y-3 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted"><span class="i-lucide-key-round text-xl text-muted-foreground" /></div>
        <h1 class="font-sans text-3xl font-bold tracking-tight">Reset your password</h1>
        <p class="text-sm text-muted-foreground">Enter your email and we will send you a reset link.</p>
      </div>
      <div class="rounded-2 border border-border dark:border-gray-800 bg-card p-8">
        <form class="space-y-5" @submit.prevent="submit">
          <input v-model="email" type="email" required placeholder="you@verbatims.cc" class="w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm text-foreground focus:border-primary/30 focus:outline-none" />
          <p v-if="error" class="text-sm text-rose-400">{{ error }}</p>
          <p v-if="sent" class="text-sm text-emerald-500">If an account exists for this email, a reset link has been sent.</p>
          <button :disabled="loading" class="w-full rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background disabled:opacity-50">{{ loading ? 'Sending…' : 'Send reset link' }}</button>
        </form>
      </div>
      <p class="text-center text-sm text-muted-foreground"><NuxtLink to="/login" class="font-medium text-foreground hover:underline">Back to sign in</NuxtLink></p>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest', pageTransition: { name: 'page', mode: 'out-in' } })
const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/forgot-password', { method: 'POST', body: { email: email.value } })
    sent.value = true
  } catch {
    error.value = 'Unable to send the reset link.'
  } finally {
    loading.value = false
  }
}
</script>
