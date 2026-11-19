import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import RecommendationSheet from '~/components/RecommendationSheet.vue'
import type { ProductSheet } from '~/types/catalog'

const product: ProductSheet = {
  id: '7a91c3d0-55e2-4b8a-9c1f-3e4d5a6b7c80',
  slug: 'lamicall',
  title: 'Lamicall — soporte ajustable',
  brand: 'Lamicall',
  imageUrl: null,
  category: { slug: 'soportes-laptop', name: 'Soportes para laptop' },
  criteria: [
    { key: 'ergonomia', label: 'Ergonomía' },
    { key: 'portabilidad', label: 'Portabilidad' },
  ],
  summary: 'Soporte con altura y ángulo regulables y base ancha.',
  idealFor: 'Quien alterna entre laptops grandes.',
  notFor: 'Buscas lo más barato posible.',
  pros: ['Altura ajustable'],
  cons: ['Más pesado'],
  scores: { ergonomia: 9, portabilidad: 7 },
  keySpecs: { Material: 'Aluminio' },
  badges: ['editor_choice'],
  priceTier: 'mid',
  rating: 4.7,
  reviewsCount: 10580,
  reviewedAt: '2026-11-18T12:00:00.000Z',
  goUrl: '/go/7a91c3d0-55e2-4b8a-9c1f-3e4d5a6b7c80?src=detail',
}

describe('RecommendationSheet', () => {
  it('muestra todos los bloques de la ficha', async () => {
    const wrapper = await mountSuspended(RecommendationSheet, { props: { product } })

    const text = wrapper.text()
    for (const expected of [
      'Por qué lo recomendamos',
      'Soporte con altura y ángulo regulables',
      'Ideal para',
      'Quien alterna entre laptops grandes',
      'No es para ti si',
      'Buscas lo más barato posible',
      'Altura ajustable',
      'Más pesado',
      'Ergonomía',
      'Portabilidad',
      'Material',
      'Aluminio',
      'Elección del asesor',
      'Precio medio',
      'Revisado',
    ]) {
      expect(text).toContain(expected)
    }
  })

  it('el botón "Ver en Amazon" usa la redirección con origen detail', async () => {
    const wrapper = await mountSuspended(RecommendationSheet, { props: { product } })

    const button = wrapper.find('[data-testid="buy-button"]')
    expect(button.text()).toContain('Ver en Amazon')
    expect(button.attributes('href')).toBe('/go/7a91c3d0-55e2-4b8a-9c1f-3e4d5a6b7c80?src=detail')
    expect(button.attributes('rel')).toContain('sponsored')
  })
})
