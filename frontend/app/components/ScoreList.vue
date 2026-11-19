<script setup lang="ts">
import type { Criterion } from '~/types/catalog'

defineProps<{ criteria: Criterion[]; scores: Record<string, number>; compact?: boolean }>()
</script>

<template>
  <dl :class="compact ? 'grid grid-cols-2 gap-x-3 gap-y-1 text-xs' : 'space-y-2 text-sm'">
    <div v-for="criterion in criteria" :key="criterion.key" class="flex items-center gap-2">
      <dt class="flex-1 text-stone-600">{{ criterion.label }}</dt>
      <dd class="flex items-center gap-2 font-semibold tabular-nums">
        <span
          v-if="!compact"
          class="block h-1.5 w-24 overflow-hidden rounded bg-stone-200"
          aria-hidden="true"
        >
          <span
            class="block h-full bg-emerald-600"
            :style="{ width: `${(scores[criterion.key] ?? 0) * 10}%` }"
          />
        </span>
        <span>{{ scores[criterion.key] ?? '–' }}<span class="font-normal text-stone-400">/10</span></span>
      </dd>
    </div>
  </dl>
</template>
