<script setup lang="ts">
import { BADGE_LABELS } from '~/types/catalog'

defineProps<{ badges: string[] }>()
</script>

<template>
  <ul v-if="badges.length" class="flex flex-wrap gap-1">
    <li
      v-for="badge in badges"
      :key="badge"
      class="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900"
    >
      {{ BADGE_LABELS[badge] ?? badge }}
    </li>
  </ul>
</template>
