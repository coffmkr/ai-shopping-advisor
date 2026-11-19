import { test } from '@japa/runner'
import { readFile } from 'node:fs/promises'
import { mapProductDetail, mapSearchResults } from '#adapters/canopy/canopy_mapper'

async function fixture(name: string) {
  const url = new URL(`../../database/fixtures/canopy/${name}`, import.meta.url)
  return JSON.parse(await readFile(url, 'utf8'))
}

test.group('Mapeo de respuestas de Canopy al dominio', () => {
  test('mapea los resultados de búsqueda sin conservar la URL del proveedor', async ({ assert }) => {
    const results = mapSearchResults(await fixture('search-soportes-laptop.json'))

    assert.isAbove(results.length, 10)
    const besign = results.find((r) => r.asin === 'B08BRCT4JH')!
    assert.equal(besign.priceUsd, 15.29)
    assert.equal(besign.rating, 4.8)
    assert.equal(besign.reviewsCount, 24564)
    assert.isFalse(besign.isSponsored)
    assert.notProperty(besign, 'url')
    assert.notInclude(JSON.stringify(results), 'superlink092-20')
  })

  test('marca los resultados patrocinados', async ({ assert }) => {
    const results = mapSearchResults(await fixture('search-soportes-laptop.json'))

    assert.isTrue(results.some((r) => r.isSponsored))
  })

  test('mapea el detalle con marca, viñetas y especificaciones', async ({ assert }) => {
    const detail = mapProductDetail(await fixture('product-B08BRCT4JH.json'))!

    assert.equal(detail.asin, 'B08BRCT4JH')
    assert.equal(detail.brand, 'BESIGN')
    assert.isAbove(detail.featureBullets.length, 2)
    assert.equal(detail.specs['Brand'], 'BESIGN')
    assert.notInclude(JSON.stringify(detail), 'superlink092-20')
  })

  test('devuelve null si el detalle no trae producto', ({ assert }) => {
    assert.isNull(mapProductDetail({ data: { amazonProduct: null } }))
  })
})
