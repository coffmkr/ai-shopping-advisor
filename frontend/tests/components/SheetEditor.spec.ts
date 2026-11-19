import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SheetEditor from '~/components/SheetEditor.vue'
import type { SheetPayload } from '~/types/admin'

const rubric = [
  { key: 'ergonomia', label: 'Ergonomía' },
  { key: 'portabilidad', label: 'Portabilidad' },
]

const draft = {
  summary: 'Soporte plegable de aluminio con doble ajuste.',
  idealFor: 'Trabajo en distintos lugares.',
  notFor: 'Escritorio fijo.',
  pros: ['Plegable', 'Ligero'],
  cons: ['Algo de juego'],
  scores: { ergonomia: 8, portabilidad: 9 },
  keySpecs: { Material: 'Aluminio' },
}

describe('SheetEditor', () => {
  it('parte del borrador y emite la ficha editada', async () => {
    const wrapper = await mountSuspended(SheetEditor, { props: { draft, rubric, errors: [] } })

    await wrapper.find('textarea[name="summary"]').setValue('Resumen editado por el administrador.')
    await wrapper.find('textarea[name="pros"]').setValue('Plegable\nLigero\n\nAluminio')
    await wrapper.find('input[name="score-ergonomia"]').setValue('10')
    await wrapper.find('input[name="badge-best_value"]').setValue(true)
    await wrapper.find('form').trigger('submit')

    const [[sheet]] = wrapper.emitted('approve') as [[SheetPayload]]
    expect(sheet.summary).toBe('Resumen editado por el administrador.')
    expect(sheet.pros).toEqual(['Plegable', 'Ligero', 'Aluminio'])
    expect(sheet.cons).toEqual(['Algo de juego'])
    expect(sheet.scores).toEqual({ ergonomia: 10, portabilidad: 9 })
    expect(sheet.keySpecs).toEqual({ Material: 'Aluminio' })
    expect(sheet.badges).toEqual(['best_value'])
  })

  it('muestra un campo de nota por cada criterio de la rúbrica', async () => {
    const wrapper = await mountSuspended(SheetEditor, { props: { draft, rubric, errors: [] } })

    expect(wrapper.find('input[name="score-ergonomia"]').exists()).toBe(true)
    expect(wrapper.find('input[name="score-portabilidad"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Ergonomía')
  })

  it('muestra los errores de validación junto a su campo', async () => {
    const wrapper = await mountSuspended(SheetEditor, {
      props: {
        draft,
        rubric,
        errors: [
          { field: 'sheet.summary', message: 'El resumen debe tener al menos 20 caracteres' },
          { field: 'sheet.scores.portabilidad', message: 'Falta la nota de "Portabilidad"' },
        ],
      },
    })

    expect(wrapper.find('[data-error-for="summary"]').text()).toContain('al menos 20 caracteres')
    expect(wrapper.find('[data-error-for="score-portabilidad"]').text()).toContain('Falta la nota')
  })

  it('el rechazo emite el motivo escrito', async () => {
    const wrapper = await mountSuspended(SheetEditor, { props: { draft, rubric, errors: [] } })

    await wrapper.find('input[name="reason"]').setValue('No es mecánico')
    await wrapper.find('[data-testid="reject"]').trigger('click')

    expect(wrapper.emitted('reject')).toEqual([['No es mecánico']])
  })
})
