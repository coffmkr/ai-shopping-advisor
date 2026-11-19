<script setup lang="ts">
import type { Criterion, ProductCard } from '~/types/catalog'

defineProps<{ product: ProductCard; criteria?: Criterion[] }>()
</script>

<template>
  <article class="flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white">
    <NuxtLink :to="`/producto/${product.slug}`" class="block bg-white p-4">
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.title"
        class="mx-auto h-40 w-full object-contain"
        loading="lazy"
      />
    </NuxtLink>

    <div class="flex flex-1 flex-col gap-3 border-t border-stone-100 p-4">
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-semibold leading-snug">
          <NuxtLink :to="`/producto/${product.slug}`" class="hover:underline">{{
            product.title
          }}</NuxtLink>
        </h3>
        <span
          class="shrink-0 rounded bg-emerald-700 px-2 py-0.5 text-sm font-bold text-white tabular-nums"
          title="Nota media del asesor"
          >{{ product.averageScore.toFixed(1) }}</span
        >
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <PriceTierTag :tier="product.priceTier" />
        <BadgeList :badges="product.badges" />
      </div>

      <p class="text-sm text-stone-600">{{ product.summary }}</p>

      <ScoreList v-if="criteria?.length" :criteria="criteria" :scores="product.scores" compact />

      <div class="mt-auto flex items-center gap-2 pt-2">
        <slot name="actions" />
        <a
          :href="product.goUrl"
          rel="sponsored nofollow noopener"
          target="_blank"
          class="ml-auto rounded bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >Ver en Amazon</a
        >
      </div>
    </div>
  </article>
</template>
