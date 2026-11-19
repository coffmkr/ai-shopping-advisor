<script setup lang="ts">
import type { CategoriesResponse } from '~/types/catalog'

const { data, error } = await useFetch<CategoriesResponse>('/api/categories')

useSeoMeta({
  title: 'AI Shopping Advisor — productos recomendados para tu escritorio',
  description: 'Pocos productos, bien elegidos y explicados: soportes, teclados y accesorios para home office.',
})
</script>

<template>
  <div class="space-y-12">
    <section class="space-y-3">
      <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
        Productos recomendados para tu escritorio
      </h1>
      <p class="max-w-2xl text-stone-600">
        No te mostramos miles de opciones: elegimos pocas, te explicamos por qué y para quién es cada una, y
        puedes compararlas antes de comprar en Amazon.
      </p>
    </section>

    <p v-if="error" class="rounded bg-rose-50 p-4 text-rose-900">
      No pudimos cargar el catálogo. Inténtalo de nuevo en unos minutos.
    </p>

    <section v-if="data" class="space-y-4">
      <h2 class="text-xl font-semibold">Categorías</h2>
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="category in data.categories" :key="category.slug">
          <NuxtLink
            :to="`/categoria/${category.slug}`"
            class="block rounded-lg border border-stone-200 bg-white p-5 hover:border-stone-400"
          >
            <span class="block font-semibold">{{ category.name }}</span>
            <span class="text-sm text-stone-500">{{ category.productCount }} recomendados</span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section v-if="data?.featured.length" class="space-y-4">
      <h2 class="text-xl font-semibold">Destacados</h2>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard v-for="product in data.featured" :key="product.id" :product="product" />
      </div>
    </section>
  </div>
</template>
