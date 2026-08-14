<template>
  <section class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-24">
    <div class="w-full max-w-md space-y-5 text-center">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted"><span class="i-lucide-mail-check text-xl text-muted-foreground" /></div>
      <h1 class="font-sans text-3xl font-bold tracking-tight">{{ loading ? 'Verifying your email…' : success ? 'Email verified' : 'Verification failed' }}</h1>
      <p class="text-sm text-muted-foreground">{{ success ? 'Your Francis account is now verified.' : error || 'We could not verify this link.' }}</p>
      <NuxtLink to="/dashboard" class="inline-flex rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background">Go to dashboard</NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()
const loading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    await $fetch('/api/auth/verify-email', { query: { token: route.query.token } })
    success.value = true
  } catch {
    error.value = 'This verification link is invalid or expired.'
  } finally {
    loading.value = false
  }
})
</script>
