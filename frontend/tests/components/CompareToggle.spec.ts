import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CompareToggle from '~/components/CompareToggle.vue'
import { useCompareSelection } from '~/composables/useCompareSelection'

describe('CompareToggle', () => {
  beforeEach(() => {
    useCompareSelection().clear()
  })

  it('añade y quita el producto de la selección', async () => {
    const wrapper = await mountSuspended(CompareToggle, {
      props: { productId: 'p1', categorySlug: 'soportes-laptop' },
    })

    await wrapper.find('input[type="checkbox"]').setValue(true)
    expect(useCompareSelection().ids.value).toEqual(['p1'])

    await wrapper.find('input[type="checkbox"]').setValue(false)
    expect(useCompareSelection().ids.value).toEqual([])
  })

  it('queda deshabilitado cuando ya hay 4 productos seleccionados', async () => {
    const selection = useCompareSelection()
    for (const id of ['a', 'b', 'c', 'd']) selection.toggle(id, 'soportes-laptop')

    const wrapper = await mountSuspended(CompareToggle, {
      props: { productId: 'e', categorySlug: 'soportes-laptop' },
    })

    expect(wrapper.find('input[type="checkbox"]').attributes('disabled')).toBeDefined()
  })

  it('al marcar un producto de otra categoría la selección empieza de nuevo', () => {
    const selection = useCompareSelection()
    selection.toggle('a', 'soportes-laptop')
    selection.toggle('k', 'teclados-mecanicos')

    expect(selection.ids.value).toEqual(['k'])
    expect(selection.categorySlug.value).toBe('teclados-mecanicos')
  })
})
