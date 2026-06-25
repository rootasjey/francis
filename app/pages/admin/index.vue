<template>
  <section class="space-y-10">
    <div>
      <h1 class="font-title text-3xl tracking-tight">Admin</h1>
      <p class="mt-1 font-meta text-xs tracking-wider text-muted-foreground uppercase">Manage API keys, limits, and billing-ready metadata.</p>
    </div>

    <div class="rounded-2xl border border-border bg-card p-5">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted">
            <span class="i-lucide-shield text-sm text-muted-foreground" />
          </div>
          <div>
            <p class="font-medium text-sm">Admin session</p>
            <p class="font-mono text-xs text-muted-foreground">{{ session.user.value?.email }}</p>
          </div>
        </div>
        <button
          class="rounded-lg border border-border bg-muted px-4 py-2 font-meta text-xs font-semibold text-foreground transition-all duration-200 hover:bg-accent"
          @click="logout"
        >
          Sign out
        </button>
      </div>
    </div>

    <div class="rounded-2xl border border-border bg-card p-6">
      <h2 class="font-title text-lg tracking-tight">Create API key</h2>
      <div class="mt-5 grid gap-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div>
          <label class="font-meta text-xs tracking-wider text-muted-foreground uppercase">Key name</label>
          <input
            v-model="form.name"
            class="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
            placeholder="Verbatims production"
          />
        </div>
        <div>
          <label class="font-meta text-xs tracking-wider text-muted-foreground uppercase">Daily limit</label>
          <input
            v-model="form.limitPerDay"
            class="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
            placeholder="10000"
          />
        </div>
        <button
          class="flex h-[42px] items-center gap-2 rounded-lg bg-primary px-6 font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="creating"
          @click="createKey"
        >
          <span v-if="creating" class="i-lucide-loader-2 animate-spin text-sm" />
          {{ creating ? 'Generating&hellip;' : 'Generate key' }}
        </button>
      </div>
      <p v-if="createError" class="mt-3 font-meta text-xs text-rose-400">{{ createError }}</p>
      <Transition name="toast">
        <div
          v-if="createdKey"
          class="mt-4 overflow-hidden rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4"
        >
          <div class="flex items-start gap-3">
            <span class="i-lucide-check-circle-2 mt-0.5 text-sm text-emerald-400" />
            <div>
              <p class="font-meta text-xs font-semibold tracking-wider text-emerald-400 uppercase">Key created</p>
              <p class="mt-1 break-all font-mono text-xs text-emerald-400/80">{{ createdKey }}</p>
              <p class="mt-1 font-meta text-[10px] text-emerald-400/60">Copy this key now. You won't see it again.</p>
            </div>
            <button
              class="ml-auto rounded-lg border border-emerald-400/30 px-3 py-1.5 font-meta text-[10px] text-emerald-400 transition-all duration-200 hover:bg-emerald-400/10"
              @click="createdKey = ''"
            >
              Dismiss
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <div class="rounded-2xl border border-border bg-card p-6">
      <div class="flex items-center justify-between">
        <h2 class="font-title text-lg tracking-tight">API keys</h2>
        <button
          class="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 font-meta text-xs text-muted-foreground transition-all duration-200 hover:bg-accent"
          :disabled="keysPending"
          @click="() => refreshKeys()"
        >
          <span class="i-lucide-refresh-cw text-xs" :class="{ 'animate-spin': keysPending }" />
          Refresh
        </button>
      </div>

      <div v-if="keysError" class="mt-4 flex items-center gap-2 rounded-lg bg-rose-400/10 p-3 font-meta text-xs text-rose-400">
        <span class="i-lucide-alert-circle text-xs" />
        Failed to load keys.
      </div>

      <!-- Loading skeleton -->
      <div v-if="keysPending" class="mt-4 space-y-3">
        <div v-for="n in 3" :key="n" class="animate-pulse rounded-xl border border-border bg-muted p-4">
          <div class="flex items-center justify-between">
            <div class="h-4 w-32 rounded bg-muted-foreground/10" />
            <div class="h-6 w-16 rounded bg-muted-foreground/10" />
          </div>
          <div class="mt-3 h-3 w-48 rounded bg-muted-foreground/10" />
        </div>
      </div>

      <TransitionGroup v-else name="key-list" tag="div" class="mt-4 space-y-3">
        <div
          v-for="key in keys"
          :key="key.id"
          class="rounded-xl border border-border bg-muted p-4 transition-all duration-200 hover:border-primary/20"
        >
          <div v-if="editing?.id === key.id" class="space-y-3">
            <input
              v-model="editing.name"
              class="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
              placeholder="Key name"
            />
            <input
              v-model="editing.limitPerDay"
              type="number"
              min="0"
              class="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
              placeholder="Daily limit"
            />
            <div class="flex gap-2">
              <button
                class="flex h-[34px] items-center gap-1.5 rounded-lg bg-primary px-4 font-meta text-xs font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="saving === key.id"
                @click="saveEdit(key.id)"
              >
                <span v-if="saving === key.id" class="i-lucide-loader-2 animate-spin text-xs" />
                {{ saving === key.id ? 'Saving&hellip;' : 'Save' }}
              </button>
              <button
                class="flex h-[34px] items-center rounded-lg border border-border bg-muted px-4 font-meta text-xs text-muted-foreground transition-all duration-200 hover:bg-accent"
                @click="cancelEdit"
              >
                Cancel
              </button>
            </div>
            <p v-if="editError" class="font-meta text-xs text-rose-400">{{ editError }}</p>
          </div>
          <template v-else>
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-medium">{{ key.name }}</p>
                <p class="mt-0.5 font-mono text-xs text-muted-foreground">{{ key.prefix }}&bullet;&bullet;&bullet;&bullet;</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  class="rounded-lg border border-border px-3 py-1.5 font-meta text-[11px] text-muted-foreground transition-all duration-200 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
                  :disabled="!!key.revokedAt"
                  @click="startEdit(key)"
                >
                  Edit
                </button>
                <button
                  class="rounded-lg border border-rose-400/30 px-3 py-1.5 font-meta text-[11px] text-rose-400 transition-all duration-200 hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-30"
                  :disabled="!!key.revokedAt"
                  @click="revokeKey(key.id)"
                >
                  {{ key.revokedAt ? 'Revoked' : 'Revoke' }}
                </button>
              </div>
            </div>
            <div class="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-meta text-xs text-muted-foreground">
              <span class="flex items-center gap-1.5">
                <span class="i-lucide-gauge text-[10px]" />
                {{ key.limitPerDay.toLocaleString() }}/day
              </span>
              <span v-if="key.lastUsedAt" class="flex items-center gap-1.5">
                <span class="i-lucide-clock text-[10px]" />
                Last used {{ formatDate(key.lastUsedAt) }}
              </span>
              <span v-if="key.revokedAt" class="flex items-center gap-1.5 text-rose-400">
                <span class="i-lucide-ban text-[10px]" />
                Revoked {{ formatDate(key.revokedAt) }}
              </span>
            </div>
          </template>
        </div>
      </TransitionGroup>

      <div v-if="!keys.length && !keysPending" class="mt-10 flex flex-col items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted">
          <span class="i-lucide-key-round text-lg text-muted-foreground/50" />
        </div>
        <div class="text-center">
          <p class="font-medium text-foreground">No API keys</p>
          <p class="mt-1 text-xs text-muted-foreground">Create your first key above to get started.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { navigateTo, useUserSession } from '#imports'
import type { ApiKeyRecord, ApiKeyListResponse, CreateKeyResponse } from '~~/shared/types/api'

type EditingState = {
  id: string
  name: string
  limitPerDay: string
}

definePageMeta({ middleware: 'admin', pageTransition: { name: 'page', mode: 'out-in' } })

const session = useUserSession()

onMounted(() => {
  refreshKeys()
})

const { data: keysData, refresh: refreshKeys, pending: keysPending, error: keysError } = useFetch<ApiKeyListResponse>(
  '/api/v1/keys',
  { immediate: false, server: false },
)

const keys = computed<ApiKeyRecord[]>(() => keysData.value?.items ?? [])

const form = reactive({
  name: '',
  limitPerDay: '',
})

const creating = ref(false)
const createdKey = ref('')
const createError = ref('')
const editing = ref<EditingState | null>(null)
const saving = ref<string | null>(null)
const editError = ref('')

function startEdit(key: ApiKeyRecord) {
  editError.value = ''
  editing.value = { id: key.id, name: key.name, limitPerDay: String(key.limitPerDay) }
}

function cancelEdit() {
  editing.value = null
  editError.value = ''
}

async function saveEdit(id: string) {
  if (!editing.value) return
  editError.value = ''

  const payload: Record<string, string | number> = {}
  if (editing.value.name.trim()) payload.name = editing.value.name.trim()
  const limit = Number(editing.value.limitPerDay)
  if (!Number.isNaN(limit) && limit >= 0) payload.limitPerDay = limit

  saving.value = id
  try {
    await $fetch(`/api/v1/keys/${id}`, { method: 'PATCH', body: payload })
    editing.value = null
    await refreshKeys()
  } catch (error: any) {
    editError.value = error?.data?.statusMessage || 'Failed to save.'
  } finally {
    saving.value = null
  }
}

async function createKey() {
  createError.value = ''
  createdKey.value = ''

  if (!form.name.trim()) {
    createError.value = 'Key name is required.'
    return
  }

  creating.value = true

  try {
    const payload: Record<string, string | number> = { name: form.name.trim() }
    if (form.limitPerDay.trim()) payload.limitPerDay = Number(form.limitPerDay)

    const response = await $fetch<CreateKeyResponse>('/api/v1/keys', {
      method: 'POST',
      body: payload,
    })

    createdKey.value = response.key
    form.name = ''
    form.limitPerDay = ''
    await refreshKeys()
  } catch (error) {
    createError.value = 'Failed to create key.'
  } finally {
    creating.value = false
  }
}

async function revokeKey(id: string) {
  await $fetch(`/api/v1/keys/${id}`, {
    method: 'DELETE',
  })
  await refreshKeys()
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await session.clear()
  await navigateTo('/login')
}

function formatDate(value?: number | null) {
  if (!value) return ''
  return new Date(value).toLocaleString()
}
</script>

<style scoped>
.key-list-enter-active,
.key-list-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.key-list-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
.key-list-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
