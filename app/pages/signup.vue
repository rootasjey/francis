<template>
  <section class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-24">
    <div class="w-full max-w-md space-y-8">
      <div class="space-y-3 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
          <span class="i-lucide-user-plus text-xl text-muted-foreground" />
        </div>
        <h1 class="font-sans text-3xl font-bold tracking-tight">Create your account</h1>
        <p class="text-sm text-muted-foreground">Start managing your API keys in minutes.</p>
      </div>

      <div class="rounded-2 border border-border dark:border-gray-800 bg-card p-8">
        <form class="space-y-5" @submit.prevent="submit">
          <div>
            <label class="text-sm font-medium text-foreground">Name</label>
            <input
              v-model="form.name"
              type="text"
              class="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
              placeholder="Alex"
            />
          </div>
          <div>
            <label class="text-sm font-medium text-foreground">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
              placeholder="you@verbatims.cc"
              required
            />
          </div>
          <div>
            <label class="text-sm font-medium text-foreground">Password</label>
            <input
              v-model="form.password"
              type="password"
              class="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
              placeholder="At least 8 characters"
              required
            />
          </div>
          <Transition name="fade">
            <p v-if="error" class="flex items-center gap-2 text-sm text-rose-400">
              <span class="i-lucide-alert-circle text-sm" />
              {{ error }}
            </p>
          </Transition>
          <button
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading"
          >
            <span v-if="loading" class="i-lucide-loader-2 animate-spin text-sm" />
            {{ loading ? 'Creating&hellip;' : 'Create account' }}
          </button>
        </form>
      </div>

      <p class="text-center text-sm text-muted-foreground">
        Already have an account?
        <NuxtLink to="/login" class="font-medium text-foreground transition-colors duration-200 hover:underline">Sign in</NuxtLink>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { navigateTo, useUserSession } from '#imports'

definePageMeta({ middleware: 'guest', pageTransition: { name: 'page', mode: 'out-in' } })

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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

