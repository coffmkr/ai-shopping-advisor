<script setup lang="ts">
import type { CompareResponse } from '~/types/catalog'

const route = useRoute()
const ids = computed(() =>
  String(route.query.ids ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
)
const enough = computed(() => ids.value.length >= 2)

const { data, error } = await useFetch<CompareResponse>('/api/compare', {
  query: computed(() => ({ ids: ids.value.join(',') })),
  immediate: enough.value,
  watch: false,
})

const errorMessage = computed(() => {
  const err = error.value as { statusCode?: number; data?: any } | null
  if (!err) return null
  if (err.statusCode === 404) return 'Algún producto de esta comparación ya no está publicado.'
  return err.data?.errors?.[0]?.message ?? err.data?.message ?? 'No pudimos cargar la comparación.'
})

useSeoMeta({
  title: () => (data.value ? `Comparar ${data.value.category.name}` : 'Comparar productos'),
  robots: 'noindex',
})
</script>

<template>
  <div class="space-y-6">
    <nav class="text-sm text-stone-500">
      <NuxtLink to="/" class="hover:underline">Inicio</NuxtLink>
      <template v-if="data">
        /
        <NuxtLink :to="`/categoria/${data.category.slug}`" class="hover:underline">{{
          data.category.name
        }}</NuxtLink>
      </template>
      / Comparar
    </nav>

    <h1 class="text-3xl font-semibold tracking-tight">
      Comparar{{ data ? ` ${data.category.name.toLowerCase()}` : ' productos' }}
    </h1>

    <p v-if="!enough" class="rounded bg-amber-50 p-4 text-amber-900" data-testid="compare-empty">
      Elige al menos 2 productos para comparar. Márcalos con la casilla "Comparar" en el listado de una
      categoría.
    </p>
    <p v-else-if="errorMessage" class="rounded bg-rose-50 p-4 text-rose-900">{{ errorMessage }}</p>
    <CompareTable v-else-if="data" :comparison="data" />
  </div>
</template>
