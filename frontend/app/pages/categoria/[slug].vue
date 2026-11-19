<script setup lang="ts">
import type { CategoryProductsResponse } from '~/types/catalog'

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data, error } = await useFetch<CategoryProductsResponse>(
  () => `/api/categories/${slug.value}/products`
)

if (error.value?.statusCode === 404) {
  throw createError({ statusCode: 404, statusMessage: 'Categoría no encontrada', fatal: true })
}

useSeoMeta({
  title: () => (data.value ? `${data.value.category.name} recomendados` : 'Categoría'),
})
</script>

<template>
  <div v-if="data" class="space-y-6">
    <nav class="text-sm text-stone-500">
      <NuxtLink to="/" class="hover:underline">Inicio</NuxtLink> / {{ data.category.name }}
    </nav>
    <header class="space-y-2">
      <h1 class="text-3xl font-semibold tracking-tight">{{ data.category.name }}</h1>
      <p class="text-stone-600">
        {{ data.products.length }} productos recomendados, ordenados por la nota del asesor.
      </p>
    </header>

    <p v-if="!data.products.length" class="text-stone-600">
      Todavía no hay productos recomendados en esta categoría.
    </p>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ProductCard
        v-for="product in data.products"
        :key="product.id"
        :product="product"
        :criteria="data.criteria"
      />
    </div>
  </div>
  <p v-else-if="error" class="rounded bg-rose-50 p-4 text-rose-900">
    No pudimos cargar la categoría. Inténtalo de nuevo en unos minutos.
  </p>
</template>
