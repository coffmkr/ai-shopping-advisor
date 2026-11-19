<script setup lang="ts">
import { PRICE_TIER_LABELS, type PriceTier } from '~/types/catalog'

const props = defineProps<{ tier: PriceTier | null }>()
const info = computed(() => (props.tier ? PRICE_TIER_LABELS[props.tier] : null))
</script>

<template>
  <span
    v-if="info"
    class="inline-flex items-center gap-1 rounded bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700"
    :title="info.label"
  >
    <span aria-hidden="true">{{ info.symbol }}</span>
    <span>{{ info.label }}</span>
  </span>
</template>
