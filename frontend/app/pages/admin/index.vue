<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Panel', robots: 'noindex' })
</script>

<template>
  <section class="space-y-6">
    <h1 class="text-2xl font-semibold">Panel de curaduría</h1>
    <div class="grid gap-4 sm:grid-cols-2">
      <NuxtLink
        to="/admin/revision"
        class="block rounded-lg border border-stone-200 bg-white p-5 hover:border-stone-400"
      >
        <span class="block font-semibold">Cola de revisión</span>
        <span class="text-sm text-stone-500">Revisa, corrige y publica los candidatos del agente.</span>
      </NuxtLink>
      <NuxtLink
        to="/admin/busquedas"
        class="block rounded-lg border border-stone-200 bg-white p-5 hover:border-stone-400"
      >
        <span class="block font-semibold">Búsquedas del agente</span>
        <span class="text-sm text-stone-500">Lanza una búsqueda en una categoría y sigue su estado.</span>
      </NuxtLink>
    </div>
  </section>
</template>
