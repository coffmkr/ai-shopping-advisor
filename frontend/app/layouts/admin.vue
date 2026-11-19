<script setup lang="ts">
const admin = useState<{ id: string; email: string } | null>('admin', () => null)

async function logout() {
  await $fetch('/api/admin/session', { method: 'DELETE' }).catch(() => null)
  admin.value = null
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="border-b border-stone-800 bg-stone-900 text-stone-100">
      <div class="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <NuxtLink to="/admin" class="font-semibold">Panel · AI Shopping Advisor</NuxtLink>
        <nav v-if="admin" class="flex gap-4 text-sm text-stone-300">
          <NuxtLink to="/admin/busquedas" class="hover:text-white">Búsquedas</NuxtLink>
          <NuxtLink to="/admin/revision" class="hover:text-white">Revisión</NuxtLink>
          <NuxtLink to="/" class="hover:text-white">Ver tienda</NuxtLink>
        </nav>
        <div v-if="admin" class="ml-auto flex items-center gap-3 text-sm">
          <span class="text-stone-400">{{ admin.email }}</span>
          <button type="button" class="rounded border border-stone-600 px-3 py-1 hover:bg-stone-800" @click="logout">
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <slot />
    </main>
  </div>
</template>
