<script setup lang="ts">
import type { CandidateSummary } from '~/types/admin'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Cola de revisión', robots: 'noindex' })

const route = useRoute()
const requestFetch = useRequestFetch()
const agentRunId = computed(() => (route.query.agentRunId as string | undefined) ?? undefined)

const { data, error, refresh } = await useAsyncData(
  () => `candidates-${agentRunId.value ?? 'all'}`,
  () =>
    requestFetch<{ data: CandidateSummary[] }>('/api/admin/candidates', {
      query: { status: 'pending', agentRunId: agentRunId.value },
    }),
  { watch: [agentRunId] }
)
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-semibold">Cola de revisión</h1>
      <span v-if="data" class="rounded bg-stone-200 px-2 py-0.5 text-sm">{{ data.data.length }} pendientes</span>
      <NuxtLink v-if="agentRunId" to="/admin/revision" class="text-sm underline">Ver todas las búsquedas</NuxtLink>
      <button type="button" class="ml-auto text-sm underline" @click="refresh()">Actualizar</button>
    </header>

    <p v-if="route.query.hecho" role="status" class="rounded bg-emerald-50 p-3 text-sm text-emerald-900">
      Candidato {{ route.query.hecho }}.
    </p>
    <p v-if="error" class="rounded bg-rose-50 p-4 text-rose-900">No pudimos cargar la cola de revisión.</p>
    <p v-else-if="data && !data.data.length" class="rounded bg-stone-100 p-4 text-stone-700">
      No hay candidatos pendientes. Lanza una búsqueda del agente para proponer productos nuevos.
    </p>

    <ul v-if="data?.data.length" class="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
      <li v-for="candidate in data.data" :key="candidate.id">
        <NuxtLink :to="`/admin/revision/${candidate.id}`" class="flex items-center gap-4 p-4 hover:bg-stone-50">
          <img
            v-if="candidate.imageUrl"
            :src="candidate.imageUrl"
            :alt="candidate.title"
            class="h-16 w-16 shrink-0 object-contain"
            loading="lazy"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium">{{ candidate.title }}</p>
            <p class="text-sm text-stone-500">
              {{ candidate.category.name }} · {{ candidate.rating.toFixed(1) }}★ ·
              {{ candidate.reviewsCount.toLocaleString('es-PE') }} valoraciones · {{ candidate.asin }}
            </p>
          </div>
          <span class="text-sm text-stone-500">Revisar →</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
