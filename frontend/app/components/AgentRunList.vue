<script setup lang="ts">
import type { AgentRun } from '~/types/admin'

defineProps<{ runs: AgentRun[] }>()

const STATUS: Record<AgentRun['status'], { label: string; classes: string }> = {
  queued: { label: 'En cola', classes: 'bg-stone-200 text-stone-800' },
  running: { label: 'Buscando…', classes: 'bg-sky-100 text-sky-900' },
  completed: { label: 'Completada', classes: 'bg-emerald-100 text-emerald-900' },
  failed: { label: 'Fallida', classes: 'bg-rose-100 text-rose-900' },
}

function when(iso: string) {
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
}
</script>

<template>
  <ul class="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
    <li v-for="run in runs" :key="run.id" class="flex flex-wrap items-center gap-3 p-4">
      <span class="rounded px-2 py-0.5 text-xs font-medium" :class="STATUS[run.status].classes">
        {{ STATUS[run.status].label }}
      </span>
      <div class="min-w-0 flex-1">
        <p class="font-medium">
          {{ run.category?.name ?? 'Categoría' }}
          <span v-if="run.maxPriceUsd !== null" class="font-normal text-stone-500">· hasta US$ {{ run.maxPriceUsd }}</span>
          <span v-if="run.isSeed" class="font-normal text-stone-500">· semilla</span>
        </p>
        <p class="text-xs text-stone-500">{{ when(run.createdAt) }}</p>
        <p v-if="run.status === 'failed' && run.errorMessage" class="mt-1 text-sm text-rose-800">
          {{ run.errorMessage }}
        </p>
      </div>
      <NuxtLink
        v-if="run.status === 'completed'"
        :to="`/admin/revision?agentRunId=${run.id}`"
        class="text-sm underline"
        >{{ run.candidatesCreated }} candidatos →</NuxtLink
      >
    </li>
  </ul>
</template>
