<template>
  <section class="border-x dark:border-gray-800 max-w-6xl mx-auto py-12 px-6 space-y-12">
    <!-- Header -->
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <span class="i-lucide-shield text-sm text-primary" />
        </div>
        <div>
          <h1 class="font-sans text-3xl font-bold tracking-tight">Admin</h1>
          <p class="font-mono text-xs text-muted-foreground/60">Manage API keys, limits, and billing-ready metadata.</p>
        </div>
      </div>
    </div>

    <!-- Admin session -->
    <div class="rounded-2 border border-border dark:border-gray-800 bg-muted/30 overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-background">
            <span class="i-lucide-shield text-xs text-muted-foreground" />
          </div>
          <div>
            <p class="text-sm font-medium">Admin session</p>
            <p class="font-mono text-xs text-muted-foreground/60">{{ session.user.value?.email }}</p>
          </div>
        </div>
        <button
          class="rounded-lg border border-border dark:border-gray-800 bg-background px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-all duration-200 hover:bg-muted"
          @click="logout"
        >
          Sign out
        </button>
      </div>
    </div>

    <!-- Create API key -->
    <div class="rounded-2 border border-border dark:border-gray-800 bg-card overflow-hidden">
      <div class="border-b border-border dark:border-gray-800 px-6 py-3.5">
        <h2 class="text-sm font-semibold">Create API key</h2>
      </div>
      <div class="p-6">
        <div class="grid gap-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div>
            <label class="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground/60 uppercase">Key name</label>
            <input
              v-model="form.name"
              class="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 font-mono text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
              placeholder="Verbatims production"
            />
          </div>
          <div>
            <label class="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground/60 uppercase">Daily limit</label>
            <input
              v-model="form.limitPerDay"
              class="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 font-mono text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
              placeholder="10000"
            />
          </div>
          <button
            class="flex h-[42px] items-center gap-2 rounded-lg bg-foreground px-6 text-sm font-semibold text-background transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="creating"
            @click="createKey"
          >
            <span v-if="creating" class="i-lucide-loader-2 animate-spin text-sm" />
            {{ creating ? 'Generating&hellip;' : 'Generate key' }}
          </button>
        </div>
        <p v-if="createError" class="mt-3 font-mono text-xs text-rose-400">{{ createError }}</p>
        <Transition name="toast">
          <div
            v-if="createdKey"
            class="mt-4 overflow-hidden rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4"
          >
            <div class="flex items-start gap-3">
              <span class="i-lucide-check-circle-2 mt-0.5 text-sm text-emerald-400" />
              <div>
                <p class="font-mono text-xs font-semibold tracking-wider text-emerald-400 uppercase">Key created</p>
                <p class="mt-1 break-all font-mono text-xs text-emerald-400/80">{{ createdKey }}</p>
                <p class="mt-1 font-mono text-[10px] text-emerald-400/60">Copy this key now. You won't see it again.</p>
              </div>
              <button
                class="ml-auto rounded-lg border border-emerald-400/30 px-3 py-1.5 font-mono text-[10px] text-emerald-400 transition-all duration-200 hover:bg-emerald-400/10"
                @click="createdKey = ''"
              >
                Dismiss
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- API keys list -->
    <div class="rounded-2 border border-border dark:border-gray-800 bg-card overflow-hidden">
      <div class="flex items-center justify-between border-b border-border dark:border-gray-800 px-6 py-3.5">
        <h2 class="text-sm font-semibold">API keys</h2>
        <button
          class="flex items-center gap-1.5 rounded-lg border border-border dark:border-gray-800 bg-background px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-all duration-200 hover:bg-muted"
          :disabled="keysPending"
          @click="() => refreshKeys()"
        >
          <span class="i-lucide-refresh-cw text-xs" :class="{ 'animate-spin': keysPending }" />
          Refresh
        </button>
      </div>

      <div v-if="keysError" class="m-6 flex items-center gap-2 rounded-lg bg-rose-400/10 p-3 font-mono text-xs text-rose-400">
        <span class="i-lucide-alert-circle text-xs" />
        Failed to load keys.
      </div>

      <!-- Loading skeleton -->
      <div v-if="keysPending" class="p-6 space-y-3">
        <div v-for="n in 3" :key="n" class="animate-pulse rounded-xl border border-border bg-muted p-4">
          <div class="flex items-center justify-between">
            <div class="h-4 w-32 rounded bg-muted-foreground/10" />
            <div class="h-6 w-16 rounded bg-muted-foreground/10" />
          </div>
          <div class="mt-3 h-3 w-48 rounded bg-muted-foreground/10" />
        </div>
      </div>

      <TransitionGroup v-else name="key-list" tag="div" class="divide-y divide-border dark:divide-gray-800">
        <div
          v-for="key in keys"
          :key="key.id"
          class="px-6 py-4 transition-all duration-200 hover:bg-muted/30"
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
                class="flex h-[34px] items-center gap-1.5 rounded-lg bg-primary px-4 font-mono text-xs font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="saving === key.id"
                @click="saveEdit(key.id)"
              >
                <span v-if="saving === key.id" class="i-lucide-loader-2 animate-spin text-xs" />
                {{ saving === key.id ? 'Saving&hellip;' : 'Save' }}
              </button>
              <button
                class="flex h-[34px] items-center rounded-lg border border-border bg-muted px-4 font-mono text-xs text-muted-foreground transition-all duration-200 hover:bg-accent"
                @click="cancelEdit"
              >
                Cancel
              </button>
            </div>
            <p v-if="editError" class="font-mono text-xs text-rose-400">{{ editError }}</p>
          </div>
          <template v-else>
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-medium">{{ key.name }}</p>
                <p class="mt-0.5 font-mono text-xs text-muted-foreground">{{ key.prefix }}&bullet;&bullet;&bullet;&bullet;</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  class="rounded-lg border border-border px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-all duration-200 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
                  :disabled="!!key.revokedAt"
                  @click="startEdit(key)"
                >
                  Edit
                </button>
                <button
                  class="rounded-lg border border-rose-400/30 px-3 py-1.5 font-mono text-[11px] text-rose-400 transition-all duration-200 hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-30"
                  :disabled="!!key.revokedAt"
                  @click="revokeKey(key.id)"
                >
                  {{ key.revokedAt ? 'Revoked' : 'Revoke' }}
                </button>
              </div>
            </div>
            <div class="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-muted-foreground">
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

      <div v-if="!keys.length && !keysPending" class="flex flex-col items-center gap-3 px-6 py-10">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted">
          <span class="i-lucide-key-round text-lg text-muted-foreground/50" />
        </div>
        <div class="text-center">
          <p class="font-medium text-foreground">No API keys</p>
          <p class="mt-1 text-xs text-muted-foreground">Create your first key above to get started.</p>
        </div>
      </div>
    </div>

    <!-- Settings -->
    <div class="rounded-2 border border-border dark:border-gray-800 bg-card overflow-hidden">
      <div class="flex items-center gap-3 border-b border-border dark:border-gray-800 px-6 py-3.5">
        <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
          <span class="i-lucide-settings text-xs text-muted-foreground" />
        </div>
        <div>
          <h2 class="text-sm font-semibold">Settings</h2>
          <p class="font-mono text-[11px] text-muted-foreground/60">OpenRouter configuration for live translations.</p>
        </div>
      </div>

      <div v-if="configPending" class="p-6 space-y-3">
        <div class="h-10 animate-pulse rounded-lg bg-muted" />
        <div class="h-10 animate-pulse rounded-lg bg-muted" />
        <div class="h-20 animate-pulse rounded-lg bg-muted" />
      </div>

      <div v-else class="p-6 space-y-5">
        <!-- Model -->
        <div>
          <label class="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground/60 uppercase">Primary model</label>
          <div class="mt-2 flex gap-2">
            <input
              v-model="configDraft.openrouter_model"
              class="flex-1 rounded-lg border border-border bg-background px-4 py-2 font-mono text-sm text-foreground transition-all duration-200 focus:border-primary/30 focus:outline-none"
              placeholder="google/gemini-3.1-flash-lite"
            />
            <button
              class="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition-all duration-200 hover:brightness-110 disabled:opacity-50"
              :disabled="!configDraft.openrouter_model || configSaving === 'openrouter_model'"
              @click="saveConfig('openrouter_model')"
            >
              {{ configSaving === 'openrouter_model' ? 'Saving...' : 'Save' }}
            </button>
          </div>
          <p class="mt-1.5 font-mono text-[11px] text-muted-foreground/60">e.g. google/gemini-3.1-flash-lite, openai/gpt-4o-mini</p>
        </div>

        <!-- Fallback models -->
        <div>
          <div class="flex items-center justify-between">
            <label class="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground/60 uppercase">Fallback models</label>
            <span class="font-mono text-[10px] text-muted-foreground/50">Tried in order if primary fails · drag the handle to reorder</span>
          </div>

          <div class="mt-2 space-y-2">
            <TransitionGroup name="fallback-list" tag="div" class="space-y-2">
              <div
                v-for="(model, idx) in fallbackList"
                :key="idx"
                :draggable="true"
                :class="[
                  'group relative flex items-center gap-3 rounded-lg border-2 p-1 transition-all duration-200',
                  draggedIndex === idx
                    ? 'border-transparent opacity-30'
                    : dragOverIndex === idx && draggedIndex !== null
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-transparent',
                ]"
                @dragstart="onDragStart($event, idx)"
                @dragover.prevent="onDragOver($event, idx)"
                @dragenter.prevent="onDragEnter(idx)"
                @dragleave="onDragLeave(idx)"
                @drop="onDrop($event, idx)"
                @dragend="onDragEnd"
              >
                <button
                  type="button"
                  class="flex h-9 w-5 shrink-0 cursor-grab items-center justify-center text-muted-foreground/30 transition-all duration-200 hover:text-primary group-hover:text-primary/70 active:cursor-grabbing"
                  :class="dragOverIndex === idx && draggedIndex !== null && draggedIndex !== idx ? 'text-primary' : ''"
                  :title="`Drag to reorder (position ${idx + 1})`"
                  :aria-label="`Drag handle for fallback model ${idx + 1}`"
                >
                  <span class="i-lucide-grip-vertical text-xs" />
                </button>
                <span
                  class="flex h-7 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-semibold tracking-tight transition-colors duration-200"
                  :class="dragOverIndex === idx && draggedIndex !== null && draggedIndex !== idx
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground'"
                >
                  {{ idx + 1 }}
                </span>
                <input
                  v-model="fallbackList[idx]"
                  class="flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-foreground transition-all duration-200 focus:border-primary/30 focus:outline-none"
                  :placeholder="idx === 0 ? 'google/gemini-2.0-flash-001' : 'next fallback model'"
                />
                <button
                  class="flex h-9 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/30 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground/30"
                  :disabled="fallbackList.length <= 1"
                  @click="removeFallback(idx)"
                >
                  <span class="i-lucide-x text-sm" />
                </button>
              </div>
            </TransitionGroup>

            <div class="flex items-center gap-2 pt-1">
              <button
                class="flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-transparent px-3 py-2 text-xs text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                @click="addFallback"
              >
                <span class="i-lucide-plus text-xs" />
                Add fallback model
              </button>

              <div class="ml-auto flex items-center gap-2">
                <button
                  v-if="fallbackListChanged"
                  class="rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  @click="loadConfig"
                >
                  Cancel
                </button>
                <button
                  class="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition-all duration-200 hover:brightness-110 disabled:opacity-50"
                  :disabled="!fallbackListChanged || configSaving === 'openrouter_fallback_models'"
                  @click="saveFallbacks()"
                >
                  <span v-if="configSaving === 'openrouter_fallback_models'" class="inline-flex items-center gap-2">
                    <span class="i-lucide-loader-2 animate-spin text-xs" />
                    Saving
                  </span>
                  <span v-else-if="!fallbackListChanged && dragJustSaved" class="inline-flex items-center gap-2">
                    <span class="i-lucide-check text-xs" />
                    Saved
                  </span>
                  <span v-else>Save order</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- API Key -->
        <div>
          <label class="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground/60 uppercase">OpenRouter API key</label>
          <div class="mt-2 flex gap-2">
            <input
              v-model="configDraft.openrouter_api_key"
              type="password"
              class="flex-1 rounded-lg border border-border bg-background px-4 py-2 font-mono text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
              :placeholder="hasStoredKey ? '•••••••••••• (stored)' : 'sk-or-v1-...'"
            />
            <button
              class="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition-all duration-200 hover:brightness-110 disabled:opacity-50"
              :disabled="!configDraft.openrouter_api_key || configSaving === 'openrouter_api_key'"
              @click="saveConfig('openrouter_api_key')"
            >
              {{ configSaving === 'openrouter_api_key' ? 'Saving...' : 'Save' }}
            </button>
          </div>
          <p class="mt-1.5 font-mono text-[11px] text-muted-foreground/60">Get one at openrouter.ai. Stored in DB, never sent to the client.</p>
        </div>

        <!-- Success/Error messages -->
        <Transition name="fade">
          <p v-if="saveMessage" class="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
            <span class="i-lucide-check-circle-2" />
            {{ saveMessage }}
          </p>
        </Transition>
        <Transition name="fade">
          <p v-if="saveError" class="flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-500">
            <span class="i-lucide-alert-circle" />
            {{ saveError }}
          </p>
        </Transition>
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

type ConfigItem = { value: string, isSecret: boolean, updatedAt: number | null, updatedBy: string | null }

const configPending = ref(true)
const configDraft = reactive<Record<string, string>>({
  openrouter_model: '',
  openrouter_api_key: '',
})
const fallbackList = ref<string[]>([])
const originalFallbacks = ref<string[]>([])
const configMeta = ref<Record<string, ConfigItem>>({})
const hasStoredKey = ref(false)
const configSaving = ref<string | null>(null)
const dragJustSaved = ref(false)
const saveMessage = ref('')
const saveError = ref('')

const fallbackListChanged = computed(() => {
  if (fallbackList.value.length !== originalFallbacks.value.length) return true
  return fallbackList.value.some((v, i) => v !== originalFallbacks.value[i])
})

function parseFallbacks(json: string): string[] {
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed.filter(v => typeof v === 'string') : []
  } catch {
    return []
  }
}

async function loadConfig() {
  try {
    const data = await $fetch<Record<string, ConfigItem>>('/api/admin/config')
    configMeta.value = data
    configDraft.openrouter_model = data.openrouter_model?.value ?? ''
    const fb = parseFallbacks(data.openrouter_fallback_models?.value ?? '[]')
    fallbackList.value = fb.length > 0 ? fb : ['']
    originalFallbacks.value = [...fallbackList.value]
    hasStoredKey.value = !!data.openrouter_api_key?.value
  } catch (err) {
    console.error('Failed to load config', err)
  } finally {
    configPending.value = false
  }
}

async function saveConfig(key: string, value?: string) {
  saveMessage.value = ''
  saveError.value = ''
  configSaving.value = key
  try {
    const payloadValue = value ?? configDraft[key]
    await $fetch('/api/admin/config', {
      method: 'POST',
      body: { key, value: payloadValue },
    })
    saveMessage.value = `Saved ${key}.`
    if (key === 'openrouter_api_key') {
      hasStoredKey.value = true
      configDraft.openrouter_api_key = ''
    }
    setTimeout(() => { saveMessage.value = '' }, 3000)
  } catch (err: any) {
    saveError.value = err?.data?.statusMessage || 'Failed to save.'
  } finally {
    configSaving.value = null
  }
}

async function saveFallbacks(showMessage = true) {
  const cleaned = fallbackList.value.map(m => m.trim()).filter(Boolean)
  if (cleaned.length === 0) {
    saveError.value = 'At least one fallback is required (or remove all to disable).'
    setTimeout(() => { saveError.value = '' }, 4000)
    return
  }
  saveError.value = ''
  configSaving.value = 'openrouter_fallback_models'
  try {
    await $fetch('/api/admin/config', {
      method: 'POST',
      body: { key: 'openrouter_fallback_models', value: JSON.stringify(cleaned) },
    })
    originalFallbacks.value = [...cleaned]
    fallbackList.value = [...cleaned]
    if (showMessage) {
      saveMessage.value = 'Saved fallback order.'
      setTimeout(() => { saveMessage.value = '' }, 3000)
    }
  } catch (err: any) {
    saveError.value = err?.data?.statusMessage || 'Failed to save.'
  } finally {
    configSaving.value = null
  }
}

let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

function autoSaveFallbacks() {
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(async () => {
    await saveFallbacks(false)
    dragJustSaved.value = true
    setTimeout(() => { dragJustSaved.value = false }, 2500)
  }, 600)
}

function addFallback() {
  fallbackList.value.push('')
}

function removeFallback(idx: number) {
  if (fallbackList.value.length <= 1) return
  fallbackList.value.splice(idx, 1)
}

// --- Drag and drop ---

const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function onDragStart(event: DragEvent, idx: number) {
  if (!event.dataTransfer) return
  draggedIndex.value = idx
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(idx))
}

function onDragOver(event: DragEvent, idx: number) {
  if (!event.dataTransfer) return
  event.dataTransfer.dropEffect = 'move'
  if (dragOverIndex.value !== idx) {
    dragOverIndex.value = idx
  }
}

function onDragEnter(idx: number) {
  if (draggedIndex.value === null || draggedIndex.value === idx) return
  dragOverIndex.value = idx
}

function onDragLeave(idx: number) {
  if (dragOverIndex.value === idx) {
    dragOverIndex.value = null
  }
}

function onDrop(event: DragEvent, idx: number) {
  event.preventDefault()
  const from = draggedIndex.value
  dragOverIndex.value = null

  if (from === null || from === idx) {
    draggedIndex.value = null
    return
  }
  const list = [...fallbackList.value]
  const [moved] = list.splice(from, 1)
  list.splice(idx, 0, moved!)
  fallbackList.value = list
  requestAnimationFrame(() => {
    draggedIndex.value = null
  })
  autoSaveFallbacks()
}

function onDragEnd() {
  draggedIndex.value = null
  dragOverIndex.value = null
}

onMounted(() => {
  refreshKeys()
  loadConfig()
})
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

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.fallback-list-enter-active,
.fallback-list-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.fallback-list-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}
.fallback-list-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
.fallback-list-move {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
