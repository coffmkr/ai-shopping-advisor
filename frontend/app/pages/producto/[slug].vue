<script setup lang="ts">
import type { ProductSheetResponse } from '~/types/catalog'

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data, error } = await useFetch<ProductSheetResponse>(() => `/api/products/${slug.value}`)

if (error.value?.statusCode === 404) {
  throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado', fatal: true })
}

useSeoMeta({
  title: () => data.value?.product.title ?? 'Producto',
  description: () => data.value?.product.summary ?? '',
})
</script>

<template>
  <div v-if="data" class="space-y-12">
    <nav class="text-sm text-stone-500">
      <NuxtLink to="/" class="hover:underline">Inicio</NuxtLink> /
      <NuxtLink :to="`/categoria/${data.product.category.slug}`" class="hover:underline">{{
        data.product.category.name
      }}</NuxtLink>
    </nav>

    <RecommendationSheet :product="data.product" />

    <section v-if="data.alternatives.length" class="space-y-4">
      <h2 class="text-xl font-semibold">Alternativas en {{ data.product.category.name }}</h2>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard v-for="product in data.alternatives" :key="product.id" :product="product" />
      </div>
    </section>

    <section v-if="data.pairings.length" class="space-y-4">
      <h2 class="text-xl font-semibold">Combina bien con</h2>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard v-for="product in data.pairings" :key="product.id" :product="product" />
      </div>
    </section>
  </div>
  <p v-else-if="error" class="rounded bg-rose-50 p-4 text-rose-900">
    No pudimos cargar el producto. Inténtalo de nuevo en unos minutos.
  </p>
</template>
