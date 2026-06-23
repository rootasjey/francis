<template>
  <section class="mx-auto max-w-lg space-y-8 rounded-3xl border border-border bg-card p-8">
    <div class="space-y-2">
      <h1 class="text-3xl font-semibold">Create your account</h1>
      <p class="text-sm text-muted-foreground">Start managing your API keys in minutes.</p>
    </div>

    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="text-xs text-muted-foreground">Name</label>
        <input
          v-model="form.name"
          type="text"
          class="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
          placeholder="Alex"
        />
      </div>
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
          placeholder="At least 8 characters"
          required
        />
      </div>
      <button
        class="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        :disabled="loading"
      >
        {{ loading ? 'Creating&hellip;' : 'Create account' }}
      </button>
      <p v-if="error" class="text-xs text-rose-400">{{ error }}</p>
    </form>

    <p class="text-xs text-muted-foreground">
      Already have an account?
      <NuxtLink to="/login" class="text-foreground hover:underline">Sign in</NuxtLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { navigateTo, useUserSession } from '#imports'

definePageMeta({ middleware: 'guest' })

const session = useUserSession()

const form = reactive({
  name: '',
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true

  try {
    await $fetch('/api/auth/signup', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        password: form.password,
      },
    })

    await session.fetch()
    const role = session.user.value?.role
    await navigateTo(role === 'admin' ? '/admin' : '/dashboard')
  } catch (err) {
    error.value = 'Unable to create account.'
  } finally {
    loading.value = false
  }
}
</script>
