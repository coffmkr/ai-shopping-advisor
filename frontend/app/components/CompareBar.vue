<script setup lang="ts">
import { MAX_COMPARE } from '~/composables/useCompareSelection'

const selection = useCompareSelection()
const count = computed(() => selection.ids.value.length)
</script>

<template>
  <div
    v-if="count > 0"
    class="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white/95 backdrop-blur"
    data-testid="compare-bar"
  >
    <div class="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
      <p class="text-sm">
        <strong>{{ count }}</strong> de {{ MAX_COMPARE }} productos para comparar
      </p>
      <button type="button" class="text-sm text-stone-500 underline" @click="selection.clear()">
        Quitar todos
      </button>
      <NuxtLink
        v-if="count >= 2"
        :to="selection.compareUrl.value"
        class="ml-auto rounded bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >Comparar ahora</NuxtLink
      >
      <span v-else class="ml-auto text-sm text-stone-500">Elige al menos 2</span>
    </div>
  </div>
</template>
