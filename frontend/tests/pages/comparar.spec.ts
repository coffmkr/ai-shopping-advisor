import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Comparar from '~/pages/comparar.vue'

describe('Página del comparador', () => {
  it('con menos de 2 productos pide elegir al menos 2 y no muestra la tabla', async () => {
    const wrapper = await mountSuspended(Comparar, { route: '/comparar?ids=un-solo-id' })

    expect(wrapper.find('[data-testid="compare-empty"]').text()).toContain(
      'Elige al menos 2 productos para comparar'
    )
    expect(wrapper.find('table').exists()).toBe(false)
  })
})
