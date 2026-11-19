import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CompareTable from '~/components/CompareTable.vue'
import type { CompareResponse, ComparedProduct } from '~/types/catalog'

function product(id: string, title: string, scores: Record<string, number>): ComparedProduct {
  return {
    id,
    slug: id,
    title,
    imageUrl: null,
    priceTier: 'mid',
    scores,
    idealFor: `Ideal ${title}`,
    pros: [`Pro ${title}`],
    cons: [`Contra ${title}`],
    keySpecs: { Material: 'Aluminio' },
    badges: [],
    goUrl: `/go/${id}?src=compare`,
  }
}

const comparison: CompareResponse = {
  category: { slug: 'soportes-laptop', name: 'Soportes para laptop' },
  criteria: [
    { key: 'ergonomia', label: 'Ergonomía' },
    { key: 'portabilidad', label: 'Portabilidad' },
  ],
  products: [
    product('a', 'Soporte A', { ergonomia: 9, portabilidad: 4 }),
    product('b', 'Soporte B', { ergonomia: 7, portabilidad: 9 }),
    product('c', 'Soporte C', { ergonomia: 6, portabilidad: 6 }),
  ],
  bestByCriterion: { ergonomia: 'a', portabilidad: 'b' },
}

describe('CompareTable', () => {
  it('muestra una columna por producto y una fila por criterio', async () => {
    const wrapper = await mountSuspended(CompareTable, { props: { comparison } })

    expect(wrapper.findAll('thead th[scope="col"]')).toHaveLength(3)
    const rowHeaders = wrapper.findAll('tbody th[scope="row"]').map((th) => th.text())
    expect(rowHeaders).toEqual(expect.arrayContaining(['Ergonomía', 'Portabilidad']))
  })

  it('marca al mejor de cada criterio con texto, no solo con color', async () => {
    const wrapper = await mountSuspended(CompareTable, { props: { comparison } })

    const best = wrapper.findAll('[data-best="true"]')
    expect(best).toHaveLength(2)
    for (const cell of best) expect(cell.text()).toContain('Mejor')
    expect(wrapper.find('[data-criterion="ergonomia"][data-product="a"]').attributes('data-best')).toBe(
      'true'
    )
  })

  it('cada columna sale a Amazon con origen compare', async () => {
    const wrapper = await mountSuspended(CompareTable, { props: { comparison } })

    const hrefs = wrapper.findAll('a[rel~="sponsored"]').map((a) => a.attributes('href'))
    expect(hrefs).toEqual(['/go/a?src=compare', '/go/b?src=compare', '/go/c?src=compare'])
  })
})
