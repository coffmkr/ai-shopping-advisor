import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ProductCard from '~/components/ProductCard.vue'
import type { Criterion, ProductCard as Card } from '~/types/catalog'

const criteria: Criterion[] = [
  { key: 'ergonomia', label: 'Ergonomía' },
  { key: 'construccion', label: 'Construcción' },
]

const product: Card = {
  id: '0b6f2d4e-91a3-4c55-8f1e-6a2b7c9d0e13',
  slug: 'besign-ls03',
  title: 'BESIGN LS03 — soporte de aluminio',
  imageUrl: 'https://m.media-amazon.com/images/I/ejemplo.jpg',
  categorySlug: 'soportes-laptop',
  priceTier: 'budget',
  summary: 'El soporte fijo más sólido de su precio.',
  scores: { ergonomia: 9, construccion: 8 },
  averageScore: 8.5,
  badges: ['best_value'],
  goUrl: '/go/0b6f2d4e-91a3-4c55-8f1e-6a2b7c9d0e13?src=listing',
}

describe('ProductCard', () => {
  it('muestra título, resumen, nota media, etiqueta y rango de precio', async () => {
    const wrapper = await mountSuspended(ProductCard, { props: { product, criteria } })

    const text = wrapper.text()
    expect(text).toContain('BESIGN LS03')
    expect(text).toContain('El soporte fijo más sólido')
    expect(text).toContain('8.5')
    expect(text).toContain('Mejor calidad-precio')
    expect(text).toContain('$')
  })

  it('muestra la nota de cada criterio', async () => {
    const wrapper = await mountSuspended(ProductCard, { props: { product, criteria } })

    expect(wrapper.text()).toContain('Ergonomía')
    expect(wrapper.text()).toContain('9')
  })

  it('enlaza a la ficha y sale a Amazon por la redirección con origen listing', async () => {
    const wrapper = await mountSuspended(ProductCard, { props: { product, criteria } })

    const hrefs = wrapper.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain('/producto/besign-ls03')
    expect(hrefs).toContain('/go/0b6f2d4e-91a3-4c55-8f1e-6a2b7c9d0e13?src=listing')
    expect(hrefs.some((href) => href?.includes('amazon.com'))).toBe(false)
  })
})
