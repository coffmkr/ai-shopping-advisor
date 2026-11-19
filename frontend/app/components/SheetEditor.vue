<script setup lang="ts">
import type { Criterion } from '~/types/catalog'
import { BADGE_LABELS } from '~/types/catalog'
import type { FieldError, SheetDraft, SheetPayload } from '~/types/admin'

const props = defineProps<{
  draft: SheetDraft
  rubric: Criterion[]
  errors: FieldError[]
  busy?: boolean
}>()

const emit = defineEmits<{
  approve: [sheet: SheetPayload]
  reject: [reason: string]
}>()

const lines = (items?: string[]) => (items ?? []).join('\n')
const specsText = (specs?: Record<string, string>) =>
  Object.entries(specs ?? {})
    .map(([name, value]) => `${name}: ${value}`)
    .join('\n')

const form = reactive({
  summary: props.draft.summary ?? '',
  idealFor: props.draft.idealFor ?? '',
  notFor: props.draft.notFor ?? '',
  pros: lines(props.draft.pros),
  cons: lines(props.draft.cons),
  keySpecs: specsText(props.draft.keySpecs),
  scores: Object.fromEntries(
    props.rubric.map((c) => [c.key, props.draft.scores?.[c.key] ?? null])
  ) as Record<string, number | null>,
  badges: [] as string[],
  reason: '',
})

function toList(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function toSpecs(text: string) {
  const specs: Record<string, string> = {}
  for (const line of toList(text)) {
    const index = line.indexOf(':')
    if (index > 0) specs[line.slice(0, index).trim()] = line.slice(index + 1).trim()
  }
  return specs
}

/** Error del campo, aceptando la ruta de VineJS (sheet.summary) o la del servicio (sheet.scores.x). */
function errorFor(field: string) {
  return props.errors.find((e) => e.field === `sheet.${field}` || e.field === field)?.message
}

function submit() {
  const scores: Record<string, number> = {}
  for (const [key, value] of Object.entries(form.scores)) {
    if (value !== null && value !== undefined && String(value) !== '') scores[key] = Number(value)
  }
  emit('approve', {
    summary: form.summary.trim(),
    idealFor: form.idealFor.trim(),
    notFor: form.notFor.trim(),
    pros: toList(form.pros),
    cons: toList(form.cons),
    scores,
    keySpecs: toSpecs(form.keySpecs),
    badges: form.badges,
    pairedProductIds: [],
  })
}

function reject() {
  emit('reject', form.reason.trim())
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submit">
    <label class="block space-y-1">
      <span class="text-sm font-semibold">Por qué lo recomendamos</span>
      <textarea v-model="form.summary" name="summary" rows="3" class="w-full rounded border border-stone-300 p-2 text-sm" />
      <span class="text-xs text-stone-500">{{ form.summary.trim().length }}/500 · mínimo 20</span>
      <p v-if="errorFor('summary')" data-error-for="summary" class="text-sm text-rose-700">{{ errorFor('summary') }}</p>
    </label>

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="block space-y-1">
        <span class="text-sm font-semibold">Ideal para</span>
        <textarea v-model="form.idealFor" name="idealFor" rows="2" class="w-full rounded border border-stone-300 p-2 text-sm" />
        <p v-if="errorFor('idealFor')" data-error-for="idealFor" class="text-sm text-rose-700">{{ errorFor('idealFor') }}</p>
      </label>
      <label class="block space-y-1">
        <span class="text-sm font-semibold">No es para ti si…</span>
        <textarea v-model="form.notFor" name="notFor" rows="2" class="w-full rounded border border-stone-300 p-2 text-sm" />
        <p v-if="errorFor('notFor')" data-error-for="notFor" class="text-sm text-rose-700">{{ errorFor('notFor') }}</p>
      </label>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="block space-y-1">
        <span class="text-sm font-semibold">Pros <span class="font-normal text-stone-500">(uno por línea, 1 a 5)</span></span>
        <textarea v-model="form.pros" name="pros" rows="4" class="w-full rounded border border-stone-300 p-2 text-sm" />
        <p v-if="errorFor('pros')" data-error-for="pros" class="text-sm text-rose-700">{{ errorFor('pros') }}</p>
      </label>
      <label class="block space-y-1">
        <span class="text-sm font-semibold">Contras <span class="font-normal text-stone-500">(uno por línea, 1 a 5)</span></span>
        <textarea v-model="form.cons" name="cons" rows="4" class="w-full rounded border border-stone-300 p-2 text-sm" />
        <p v-if="errorFor('cons')" data-error-for="cons" class="text-sm text-rose-700">{{ errorFor('cons') }}</p>
      </label>
    </div>

    <fieldset class="space-y-2">
      <legend class="text-sm font-semibold">Nota del asesor (0 a 10)</legend>
      <div class="grid gap-3 sm:grid-cols-2">
        <label v-for="criterion in rubric" :key="criterion.key" class="flex items-center gap-3 text-sm">
          <span class="flex-1">{{ criterion.label }}</span>
          <input
            v-model.number="form.scores[criterion.key]"
            :name="`score-${criterion.key}`"
            type="number"
            min="0"
            max="10"
            step="1"
            class="w-20 rounded border border-stone-300 p-1 text-right"
          />
          <span
            v-if="errorFor(`scores.${criterion.key}`)"
            :data-error-for="`score-${criterion.key}`"
            class="text-xs text-rose-700"
            >{{ errorFor(`scores.${criterion.key}`) }}</span
          >
        </label>
      </div>
    </fieldset>

    <label class="block space-y-1">
      <span class="text-sm font-semibold">Especificaciones clave <span class="font-normal text-stone-500">("clave: valor" por línea)</span></span>
      <textarea v-model="form.keySpecs" name="keySpecs" rows="4" class="w-full rounded border border-stone-300 p-2 font-mono text-sm" />
    </label>

    <fieldset class="space-y-2">
      <legend class="text-sm font-semibold">Etiquetas</legend>
      <div class="flex flex-wrap gap-4">
        <label v-for="(label, badge) in BADGE_LABELS" :key="badge" class="flex items-center gap-2 text-sm">
          <input v-model="form.badges" :name="`badge-${badge}`" type="checkbox" :value="badge" class="accent-stone-900" />
          {{ label }}
        </label>
      </div>
    </fieldset>

    <div class="flex flex-wrap items-end gap-3 border-t border-stone-200 pt-5">
      <button
        type="submit"
        :disabled="busy"
        class="rounded bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        Aprobar y publicar
      </button>
      <label class="ml-auto block space-y-1 text-sm">
        <span class="text-stone-600">Motivo del rechazo (opcional)</span>
        <input v-model="form.reason" name="reason" type="text" maxlength="500" class="w-64 rounded border border-stone-300 p-2" />
      </label>
      <button
        type="button"
        data-testid="reject"
        :disabled="busy"
        class="rounded border border-rose-300 px-4 py-2 font-medium text-rose-800 hover:bg-rose-50 disabled:opacity-60"
        @click="reject"
      >
        Rechazar
      </button>
    </div>
  </form>
</template>
