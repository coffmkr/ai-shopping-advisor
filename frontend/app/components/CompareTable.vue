<script setup lang="ts">
import type { CompareResponse } from '~/types/catalog'

const props = defineProps<{ comparison: CompareResponse }>()

function isBest(criterion: string, productId: string) {
  return props.comparison.bestByCriterion[criterion] === productId
}

const specNames = computed(() => {
  const names = new Set<string>()
  for (const product of props.comparison.products) {
    for (const name of Object.keys(product.keySpecs)) names.add(name)
  }
  return [...names]
})
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-stone-200 bg-white">
    <table class="w-full min-w-[640px] border-collapse text-sm">
      <caption class="sr-only">
        Comparación de {{ comparison.products.length }} productos de {{ comparison.category.name }}
      </caption>
      <thead>
        <tr>
          <td class="sticky left-0 w-40 bg-white" />
          <th
            v-for="product in comparison.products"
            :key="product.id"
            scope="col"
            class="border-l border-stone-100 p-4 text-left align-top font-normal"
          >
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              :alt="product.title"
              class="mb-3 h-28 w-full object-contain"
            />
            <NuxtLink :to="`/producto/${product.slug}`" class="block font-semibold hover:underline">{{
              product.title
            }}</NuxtLink>
            <div class="mt-2 flex flex-wrap gap-1">
              <PriceTierTag :tier="product.priceTier" />
              <BadgeList :badges="product.badges" />
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="criterion in comparison.criteria" :key="criterion.key" class="border-t border-stone-100">
          <th scope="row" class="sticky left-0 bg-white p-3 text-left font-medium text-stone-600">
            {{ criterion.label }}
          </th>
          <td
            v-for="product in comparison.products"
            :key="product.id"
            :data-criterion="criterion.key"
            :data-product="product.id"
            :data-best="isBest(criterion.key, product.id) ? 'true' : undefined"
            class="border-l border-stone-100 p-3"
            :class="isBest(criterion.key, product.id) ? 'bg-emerald-50' : ''"
          >
            <span class="font-semibold tabular-nums">{{ product.scores[criterion.key] ?? '–' }}</span
            ><span class="text-stone-400">/10</span>
            <span
              v-if="isBest(criterion.key, product.id)"
              class="ml-2 rounded bg-emerald-700 px-1.5 py-0.5 text-xs font-medium text-white"
              >★ Mejor</span
            >
          </td>
        </tr>
        <tr class="border-t border-stone-100">
          <th scope="row" class="sticky left-0 bg-white p-3 text-left font-medium text-stone-600">
            Ideal para
          </th>
          <td v-for="product in comparison.products" :key="product.id" class="border-l border-stone-100 p-3">
            {{ product.idealFor }}
          </td>
        </tr>
        <tr class="border-t border-stone-100">
          <th scope="row" class="sticky left-0 bg-white p-3 text-left font-medium text-stone-600">Pros</th>
          <td v-for="product in comparison.products" :key="product.id" class="border-l border-stone-100 p-3">
            <ul class="space-y-1">
              <li v-for="pro in product.pros" :key="pro">✔ {{ pro }}</li>
            </ul>
          </td>
        </tr>
        <tr class="border-t border-stone-100">
          <th scope="row" class="sticky left-0 bg-white p-3 text-left font-medium text-stone-600">
            Contras
          </th>
          <td v-for="product in comparison.products" :key="product.id" class="border-l border-stone-100 p-3">
            <ul class="space-y-1">
              <li v-for="con in product.cons" :key="con">✘ {{ con }}</li>
            </ul>
          </td>
        </tr>
        <tr v-for="name in specNames" :key="name" class="border-t border-stone-100">
          <th scope="row" class="sticky left-0 bg-white p-3 text-left font-medium text-stone-600">
            {{ name }}
          </th>
          <td v-for="product in comparison.products" :key="product.id" class="border-l border-stone-100 p-3">
            {{ product.keySpecs[name] ?? '–' }}
          </td>
        </tr>
        <tr class="border-t border-stone-100">
          <td class="sticky left-0 bg-white" />
          <td v-for="product in comparison.products" :key="product.id" class="border-l border-stone-100 p-3">
            <a
              :href="product.goUrl"
              rel="sponsored nofollow noopener"
              target="_blank"
              class="inline-block rounded bg-stone-900 px-3 py-2 font-medium text-white hover:bg-stone-700"
              >Ver en Amazon</a
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
