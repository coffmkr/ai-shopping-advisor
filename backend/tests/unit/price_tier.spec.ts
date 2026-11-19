import { test } from '@japa/runner'
import { assignPriceTiers } from '#services/price_tier'

test.group('Rango de precio por terciles dentro de la categoría', () => {
  test('con tres productos asigna económico, medio y premium', ({ assert }) => {
    const tiers = assignPriceTiers([
      { id: 'caro', priceUsd: 54.99 },
      { id: 'barato', priceUsd: 15.29 },
      { id: 'medio', priceUsd: 29.99 },
    ])

    assert.deepEqual(tiers, { barato: 'budget', medio: 'mid', caro: 'premium' })
  })

  test('con seis productos reparte dos por rango', ({ assert }) => {
    const tiers = assignPriceTiers(
      [10, 20, 30, 40, 50, 60].map((price) => ({ id: `p${price}`, priceUsd: price }))
    )

    assert.deepEqual(Object.values(tiers), ['budget', 'budget', 'mid', 'mid', 'premium', 'premium'])
  })

  test('con un solo producto lo deja en rango medio', ({ assert }) => {
    assert.deepEqual(assignPriceTiers([{ id: 'unico', priceUsd: 10 }]), { unico: 'mid' })
  })

  test('los productos sin precio quedan fuera', ({ assert }) => {
    const tiers = assignPriceTiers([
      { id: 'a', priceUsd: 10 },
      { id: 'b', priceUsd: null },
    ])

    assert.notProperty(tiers, 'b')
  })
})
