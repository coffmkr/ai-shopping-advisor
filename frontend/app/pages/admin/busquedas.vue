<script setup lang="ts">
import type { AgentRun } from '~/types/admin'
import type { CategoriesResponse } from '~/types/catalog'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Búsquedas del agente', robots: 'noindex' })

const requestFetch = useRequestFetch()
const { data: catalog } = await useFetch<CategoriesResponse>('/api/categories')
const { data: runs, refresh } = await useAsyncData('agent-runs', () =>
  requestFetch<{ data: AgentRun[] }>('/api/admin/agent-runs')
)

const categoryId = ref('')
const maxPriceUsd = ref<number | null>(null)
const submitting = ref(false)
const message = ref<{ kind: 'ok' | 'error'; text: string } | null>(null)

const hasActive = computed(() =>
  (runs.value?.data ?? []).some((run) => run.status === 'queued' || run.status === 'running')
)

// Mientras haya búsquedas en curso, se consulta su estado cada 3 segundos
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => {
    if (hasActive.value) refresh()
  }, 3000)
})
onBeforeUnmount(() => clearInterval(timer))

async function launch() {
  message.value = null
  submitting.value = true
  try {
    await $fetch('/api/admin/agent-runs', {
      method: 'POST',
      body: {
        categoryId: categoryId.value,
        ...(maxPriceUsd.value ? { maxPriceUsd: maxPriceUsd.value } : {}),
      },
    })
    message.value = { kind: 'ok', text: 'Búsqueda encolada. El agente la ejecutará en segundo plano.' }
    await refresh()
  } catch (error: any) {
    message.value = {
      kind: 'error',
      text:
        error?.data?.message ??
        error?.data?.errors?.[0]?.message ??
        'No pudimos lanzar la búsqueda. Inténtalo de nuevo.',
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="space-y-6">
    <h1 class="text-2xl font-semibold">Búsquedas del agente</h1>

    <form class="flex flex-wrap items-end gap-4 rounded-lg border border-stone-200 bg-white p-5" @submit.prevent="launch">
      <label class="block space-y-1 text-sm">
        <span class="font-medium">Categoría</span>
        <select v-model="categoryId" required class="block w-56 rounded border border-stone-300 p-2">
          <option value="" disabled>Elige una categoría</option>
          <option v-for="category in catalog?.categories ?? []" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </label>
      <label class="block space-y-1 text-sm">
        <span class="font-medium">Precio máximo (US$, opcional)</span>
        <input
          v-model.number="maxPriceUsd"
          type="number"
          min="1"
          max="1000"
          step="1"
          class="block w-40 rounded border border-stone-300 p-2"
        />
      </label>
      <button
        type="submit"
        :disabled="submitting || !categoryId"
        class="rounded bg-stone-900 px-5 py-2 font-medium text-white hover:bg-stone-700 disabled:opacity-60"
      >
        {{ submitting ? 'Lanzando…' : 'Lanzar búsqueda' }}
      </button>
    </form>

    <p
      v-if="message"
      role="status"
      class="rounded p-3 text-sm"
      :class="message.kind === 'ok' ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'"
    >
      {{ message.text }}
    </p>

    <p v-if="hasActive" class="text-sm text-stone-500">Actualizando el estado cada 3 segundos…</p>
    <AgentRunList v-if="runs?.data.length" :runs="runs.data" />
    <p v-else class="text-stone-600">Todavía no hay búsquedas.</p>
  </section>
</template>
