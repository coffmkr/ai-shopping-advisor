import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AffiliateNotice from '~/components/AffiliateNotice.vue'

describe('AffiliateNotice', () => {
  it('muestra el aviso de afiliado de Amazon', async () => {
    const wrapper = await mountSuspended(AffiliateNotice)

    expect(wrapper.text()).toContain('Afiliado de Amazon')
  })
})
