<script setup lang="ts">
import type { CandidateDetail, FieldError, SheetPayload } from '~/types/admin'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const requestFetch = useRequestFetch()
const id = String(route.params.id)

const { data: candidate, error } = await useAsyncData(`candidate-${id}`, () =>
  requestFetch<CandidateDetail>(`/api/admin/candidates/${id}`)
)
useSeoMeta({ title: () => `Revisar: ${candidate.value?.title ?? 'candidato'}`, robots: 'noindex' })

const errors = ref<FieldError[]>([])
const message = ref<string | null>(null)
const busy = ref(false)

function toFieldErrors(data: any): FieldError[] {
  return (data?.errors ?? []).map((e: any) => ({ field: e.field, message: e.message }))
}

async function decide(body: Record<string, unknown>) {
  busy.value = true
  errors.value = []
  message.value = null
  try {
    const result = await $fetch<{ status: string; slug: string }>(`/api/admin/candidates/${id}`, {
      method: 'PATCH',
      body,
    })
    await navigateTo({
      path: '/admin/revision',
      query: { hecho: result.status === 'approved' ? 'aprobado' : 'rechazado' },
    })
  } catch (err: any) {
    const status = err?.statusCode ?? err?.response?.status
    if (status === 422) {
      errors.value = toFieldErrors(err.data)
      message.value = 'Revisa los campos marcados.'
    } else if (status === 409) {
      message.value = 'Este candidato ya fue revisado.'
    } else {
      message.value = 'No pudimos guardar la decisión. Inténtalo de nuevo.'
    }
  } finally {
    busy.value = false
  }
}

const approve = (sheet: SheetPayload) => decide({ action: 'approve', sheet })
const reject = (reason: string) => decide({ action: 'reject', ...(reason ? { reason } : {}) })
</script>

<template>
  <section class="space-y-6">
    <NuxtLink to="/admin/revision" class="text-sm underline">← Volver a la cola</NuxtLink>

    <p v-if="error" class="rounded bg-rose-50 p-4 text-rose-900">El candidato no existe.</p>

    <template v-if="candidate">
      <header class="flex gap-6 rounded-lg border border-stone-200 bg-white p-5">
        <img v-if="candidate.imageUrl" :src="candidate.imageUrl" :alt="candidate.title" class="h-28 w-28 object-contain" />
        <div class="space-y-1">
          <p class="text-sm text-stone-500">{{ candidate.category.name }} · {{ candidate.asin }}</p>
          <h1 class="text-xl font-semibold">{{ candidate.title }}</h1>
          <p class="text-sm text-stone-600">
            {{ candidate.rating.toFixed(1) }}★ · {{ candidate.reviewsCount.toLocaleString('es-PE') }} valoraciones
            <template v-if="candidate.referencePriceUsd !== null">
              · precio de referencia US$ {{ candidate.referencePriceUsd.toFixed(2) }} (solo visible en el panel)
            </template>
          </p>
          <p v-if="candidate.status !== 'pending'" class="text-sm font-medium text-amber-800">
            Estado: {{ candidate.status }}
          </p>
        </div>
      </header>

      <p v-if="message" role="alert" class="rounded bg-amber-50 p-3 text-sm text-amber-900">{{ message }}</p>

      <div class="rounded-lg border border-stone-200 bg-white p-5">
        <h2 class="mb-4 text-lg font-semibold">Ficha de recomendación</h2>
        <SheetEditor
          :draft="candidate.draft"
          :rubric="candidate.rubric"
          :errors="errors"
          :busy="busy || candidate.status !== 'pending'"
          @approve="approve"
          @reject="reject"
        />
      </div>
    </template>
  </section>
</template>
