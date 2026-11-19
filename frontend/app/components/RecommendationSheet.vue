<script setup lang="ts">
import type { ProductSheet } from '~/types/catalog'

const props = defineProps<{ product: ProductSheet }>()

const reviewedOn = computed(() =>
  props.product.reviewedAt
    ? new Date(props.product.reviewedAt).toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null
)
</script>

<template>
  <article class="grid gap-8 md:grid-cols-[2fr_3fr]">
    <div class="rounded-lg border border-stone-200 bg-white p-6">
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.title"
        class="mx-auto max-h-80 w-full object-contain"
      />
    </div>

    <div class="space-y-6">
      <header class="space-y-3">
        <p class="text-sm text-stone-500">
          <NuxtLink :to="`/categoria/${product.category.slug}`" class="hover:underline">{{
            product.category.name
          }}</NuxtLink>
          <span v-if="product.brand"> · {{ product.brand }}</span>
        </p>
        <h1 class="text-2xl font-semibold tracking-tight">{{ product.title }}</h1>
        <div class="flex flex-wrap items-center gap-2">
          <PriceTierTag :tier="product.priceTier" />
          <BadgeList :badges="product.badges" />
        </div>
        <a
          :href="product.goUrl"
          data-testid="buy-button"
          rel="sponsored nofollow noopener"
          target="_blank"
          class="inline-block rounded bg-stone-900 px-5 py-3 font-medium text-white hover:bg-stone-700"
          >Ver en Amazon</a
        >
      </header>

      <section>
        <h2 class="mb-1 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Por qué lo recomendamos
        </h2>
        <p>{{ product.summary }}</p>
      </section>

      <section class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg bg-emerald-50 p-4">
          <h2 class="mb-1 text-sm font-semibold text-emerald-900">Ideal para</h2>
          <p class="text-sm">{{ product.idealFor }}</p>
        </div>
        <div class="rounded-lg bg-rose-50 p-4">
          <h2 class="mb-1 text-sm font-semibold text-rose-900">No es para ti si</h2>
          <p class="text-sm">{{ product.notFor }}</p>
        </div>
      </section>

      <section class="grid gap-4 sm:grid-cols-2">
        <div>
          <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">Pros</h2>
          <ul class="space-y-1 text-sm">
            <li v-for="pro in product.pros" :key="pro" class="flex gap-2">
              <span class="text-emerald-700" aria-hidden="true">✔</span>{{ pro }}
            </li>
          </ul>
        </div>
        <div>
          <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">Contras</h2>
          <ul class="space-y-1 text-sm">
            <li v-for="con in product.cons" :key="con" class="flex gap-2">
              <span class="text-rose-700" aria-hidden="true">✘</span>{{ con }}
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Nota del asesor
        </h2>
        <ScoreList :criteria="product.criteria" :scores="product.scores" />
      </section>

      <section>
        <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Especificaciones clave
        </h2>
        <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <template v-for="(value, name) in product.keySpecs" :key="name">
            <dt class="text-stone-500">{{ name }}</dt>
            <dd>{{ value }}</dd>
          </template>
        </dl>
      </section>

      <p v-if="reviewedOn" class="text-xs text-stone-500">Revisado por el equipo el {{ reviewedOn }}</p>
    </div>
  </article>
</template>
