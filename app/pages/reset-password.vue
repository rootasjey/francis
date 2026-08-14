<template>
  <section class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-24">
    <div class="w-full max-w-md space-y-8">
      <div class="space-y-3 text-center"><h1 class="font-sans text-3xl font-bold tracking-tight">Choose a new password</h1><p class="text-sm text-muted-foreground">Use at least 8 characters.</p></div>
      <div class="rounded-2 border border-border dark:border-gray-800 bg-card p-8">
        <form class="space-y-5" @submit.prevent="submit">
          <input v-model="password" type="password" minlength="8" required placeholder="New password" class="w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm text-foreground focus:border-primary/30 focus:outline-none" />
          <p v-if="error" class="text-sm text-rose-400">{{ error }}</p>
          <button :disabled="loading || !token" class="w-full rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background disabled:opacity-50">{{ loading ? 'Updating…' : 'Update password' }}</button>
        </form>
      </div>
      <p v-if="success" class="text-center text-sm text-emerald-500">Password updated. <NuxtLink to="/login" class="font-medium underline">Sign in</NuxtLink></p>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()
const token = String(route.query.token || '')
const password = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/reset-password', { method: 'POST', body: { token, password: password.value } })
    success.value = true
  } catch {
    error.value = 'This reset link is invalid or expired.'
  } finally {
    loading.value = false
  }
}
</script>
