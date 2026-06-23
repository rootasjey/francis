<template>
  <section class="mx-auto max-w-lg space-y-8 rounded-3xl border border-border bg-card p-8">
    <div class="space-y-2">
      <h1 class="text-3xl font-semibold">Welcome back</h1>
      <p class="text-sm text-muted-foreground">Sign in to access your dashboard.</p>
    </div>

    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="text-xs text-muted-foreground">Email</label>
        <input
          v-model="form.email"
          type="email"
          class="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
          placeholder="you@verbatims.cc"
          required
        />
      </div>
      <div>
        <label class="text-xs text-muted-foreground">Password</label>
        <input
          v-model="form.password"
          type="password"
          class="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
          placeholder="••••••••"
          required
        />
      </div>
      <button
        class="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        :disabled="loading"
      >
        {{ loading ? 'Signing in&hellip;' : 'Sign in' }}
      </button>
      <p v-if="error" class="text-xs text-rose-400">{{ error }}</p>
    </form>

    <p class="text-xs text-muted-foreground">
      New here?
      <NuxtLink to="/signup" class="text-foreground hover:underline">Create an account</NuxtLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { navigateTo, useUserSession } from '#imports'

definePageMeta({ middleware: 'guest' })

const session = useUserSession()

const form = reactive({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password,
      },
    })

    await session.fetch()
    const role = session.user.value?.role
    await navigateTo(role === 'admin' ? '/admin' : '/dashboard')
  } catch (err) {
    error.value = 'Unable to sign in.'
  } finally {
    loading.value = false
  }
}
</script>
