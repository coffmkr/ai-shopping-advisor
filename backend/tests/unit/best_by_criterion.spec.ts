import { test } from '@japa/runner'
import { bestByCriterion } from '#services/compare'

const criteria = ['ergonomia', 'portabilidad']

test.group('Mejor producto por criterio', () => {
  test('gana la nota más alta en cada criterio', ({ assert }) => {
    const best = bestByCriterion(criteria, [
      { id: 'a', rating: 4.5, reviewsCount: 100, scores: { ergonomia: 9, portabilidad: 4 } },
      { id: 'b', rating: 4.5, reviewsCount: 100, scores: { ergonomia: 7, portabilidad: 9 } },
    ])

    assert.deepEqual(best, { ergonomia: 'a', portabilidad: 'b' })
  })

  test('en empate gana la mayor valoración en Amazon', ({ assert }) => {
    const best = bestByCriterion(
      ['ergonomia'],
      [
        { id: 'a', rating: 4.5, reviewsCount: 900, scores: { ergonomia: 8 } },
        { id: 'b', rating: 4.8, reviewsCount: 100, scores: { ergonomia: 8 } },
      ]
    )

    assert.deepEqual(best, { ergonomia: 'b' })
  })

  test('si también empata la valoración, gana el de más reseñas', ({ assert }) => {
    const best = bestByCriterion(
      ['ergonomia'],
      [
        { id: 'a', rating: 4.7, reviewsCount: 100, scores: { ergonomia: 8 } },
        { id: 'b', rating: 4.7, reviewsCount: 900, scores: { ergonomia: 8 } },
      ]
    )

    assert.deepEqual(best, { ergonomia: 'b' })
  })

  test('el resultado no depende del orden de los productos', ({ assert }) => {
    const products = [
      { id: 'a', rating: 4.7, reviewsCount: 100, scores: { ergonomia: 8, portabilidad: 8 } },
      { id: 'b', rating: 4.7, reviewsCount: 100, scores: { ergonomia: 8, portabilidad: 8 } },
      { id: 'c', rating: 4.2, reviewsCount: 50, scores: { ergonomia: 6, portabilidad: 8 } },
    ]

    assert.deepEqual(
      bestByCriterion(criteria, products),
      bestByCriterion(criteria, [...products].reverse())
    )
  })
})
