<script setup lang="ts">
const props = defineProps<{ productId: string; categorySlug: string }>()

const selection = useCompareSelection()
const checked = computed(() => selection.has(props.productId))
const disabled = computed(
  () =>
    !checked.value && selection.isFull.value && selection.categorySlug.value === props.categorySlug
)

function onChange() {
  selection.toggle(props.productId, props.categorySlug)
}
</script>

<template>
  <label
    class="inline-flex items-center gap-2 text-sm"
    :class="disabled ? 'cursor-not-allowed text-stone-400' : 'cursor-pointer text-stone-700'"
    :title="disabled ? 'Puedes comparar hasta 4 productos' : undefined"
  >
    <input
      type="checkbox"
      class="h-4 w-4 accent-stone-900"
      :checked="checked"
      :disabled="disabled"
      @change="onChange"
    />
    Comparar
  </label>
</template>
