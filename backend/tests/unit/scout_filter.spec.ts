import { test } from '@japa/runner'
import { readFile } from 'node:fs/promises'
import { mapSearchResults } from '#adapters/canopy/canopy_mapper'
import { filterSearchResults, MAX_CANDIDATES } from '#services/scout_filter'
import type { ProviderSearchResult } from '#ports/catalog_provider'

async function laptopResults() {
  const url = new URL('../../database/fixtures/canopy/search-soportes-laptop.json', import.meta.url)
  return mapSearchResults(JSON.parse(await readFile(url, 'utf8')))
}

function item(overrides: Partial<ProviderSearchResult>): ProviderSearchResult {
  return {
    asin: 'B000000001',
    title: 'Producto',
    brand: null,
    imageUrl: null,
    priceUsd: 20,
    rating: 4.5,
    reviewsCount: 1000,
    isSponsored: false,
    isPrime: true,
    ...overrides,
  }
}

test.group('Filtrado de resultados del agente', () => {
  test('descarta los patrocinados de una búsqueda real', async ({ assert }) => {
    const results = await laptopResults()
    assert.isTrue(results.some((r) => r.isSponsored))

    const kept = filterSearchResults(results, { existingAsins: new Set() })

    assert.isFalse(kept.some((r) => r.isSponsored))
  })

  test('respeta el precio máximo', async ({ assert }) => {
    const kept = filterSearchResults(await laptopResults(), {
      maxPriceUsd: 20,
      existingAsins: new Set(),
    })

    assert.isAbove(kept.length, 0)
    assert.isTrue(kept.every((r) => r.priceUsd! <= 20))
  })

  test('devuelve como máximo 4, ordenados por valoración ponderada', async ({ assert }) => {
    const kept = filterSearchResults(await laptopResults(), { existingAsins: new Set() })

    assert.isAtMost(kept.length, MAX_CANDIDATES)
    const weights = kept.map((r) => r.rating! * Math.log10(r.reviewsCount!))
    assert.deepEqual(
      weights,
      [...weights].sort((a, b) => b - a)
    )
    assert.equal(kept[0].asin, 'B08BRCT4JH')
  })

  test('omite productos que ya existen en el sistema', async ({ assert }) => {
    const kept = filterSearchResults(await laptopResults(), {
      existingAsins: new Set(['B08BRCT4JH']),
    })

    assert.notInclude(
      kept.map((r) => r.asin),
      'B08BRCT4JH'
    )
  })

  test('descarta variantes repetidas y datos incompletos', ({ assert }) => {
    const kept = filterSearchResults(
      [
        item({ asin: 'B000000001' }),
        item({ asin: 'B000000002' }),
        item({ asin: 'B000000003', priceUsd: null }),
        item({ asin: 'B000000004', rating: null }),
        item({ asin: 'b-invalido' }),
      ],
      { existingAsins: new Set() }
    )

    assert.deepEqual(
      kept.map((r) => r.asin),
      ['B000000001']
    )
  })
})
