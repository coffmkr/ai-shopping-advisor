<script setup lang="ts">
const { data: health, error } = await useFetch('/api/health')
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-3xl font-semibold tracking-tight">Productos recomendados para tu escritorio</h1>
    <p class="text-stone-600">El catálogo se construye en el ticket T1.</p>
    <p class="text-sm" data-testid="api-status">
      Estado de la API:
      <strong v-if="health?.status === 'ok'">conectada</strong>
      <strong v-else-if="error">sin conexión</strong>
    </p>
  </section>
</template>
