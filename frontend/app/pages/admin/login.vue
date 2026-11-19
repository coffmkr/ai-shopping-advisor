<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Acceso al panel', robots: 'noindex' })

const email = ref('')
const password = ref('')
const errorMessage = ref<string | null>(null)
const submitting = ref(false)
const admin = useState<{ id: string; email: string } | null>('admin', () => null)

async function submit() {
  errorMessage.value = null
  submitting.value = true
  try {
    admin.value = await $fetch('/api/admin/session', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    await navigateTo('/admin')
  } catch (error: any) {
    errorMessage.value =
      error?.data?.message ??
      error?.data?.errors?.[0]?.message ??
      'No pudimos iniciar sesión. Inténtalo de nuevo.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="mx-auto max-w-sm space-y-6 rounded-lg border border-stone-200 bg-white p-6">
    <h1 class="text-xl font-semibold">Acceso al panel</h1>
    <form class="space-y-4" @submit.prevent="submit">
      <label class="block space-y-1 text-sm">
        <span class="font-medium">Email</span>
        <input
          v-model="email"
          type="email"
          required
          autocomplete="username"
          class="w-full rounded border border-stone-300 px-3 py-2"
        />
      </label>
      <label class="block space-y-1 text-sm">
        <span class="font-medium">Contraseña</span>
        <input
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="w-full rounded border border-stone-300 px-3 py-2"
        />
      </label>
      <p v-if="errorMessage" role="alert" class="rounded bg-rose-50 p-3 text-sm text-rose-900">
        {{ errorMessage }}
      </p>
      <button
        type="submit"
        :disabled="submitting"
        class="w-full rounded bg-stone-900 px-4 py-2 font-medium text-white hover:bg-stone-700 disabled:opacity-60"
      >
        {{ submitting ? 'Entrando…' : 'Entrar' }}
      </button>
    </form>
  </section>
</template>
