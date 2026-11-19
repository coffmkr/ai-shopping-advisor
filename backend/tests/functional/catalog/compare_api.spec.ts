import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import MainSeeder from '#database/seeders/main_seeder'

async function seed() {
  await new MainSeeder(db.connection()).run()
}

async function idOf(slug: string) {
  const row = await db.from('products').where('slug', slug).firstOrFail()
  return row.id as string
}

const BESIGN = 'besign-ls03-soporte-laptop-aluminio'
const LAMICALL = 'lamicall-soporte-laptop-ajustable'
const TOUNEE = 'tounee-soporte-laptop-telescopico-giratorio'
const F75 = 'aula-f75-teclado-mecanico-inalambrico'

test.group('API del comparador', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('compara productos de la misma categoría en el orden pedido', async ({ client, assert }) => {
    await seed()
    const ids = [await idOf(TOUNEE), await idOf(BESIGN)]

    const response = await client.get(`/api/compare?ids=${ids.join(',')}`)

    response.assertStatus(200)
    const body = response.body()
    assert.deepEqual(body.category, { slug: 'soportes-laptop', name: 'Soportes para laptop' })
    assert.deepEqual(
      body.criteria.map((c: any) => c.key),
      ['ergonomia', 'construccion', 'portabilidad', 'calidad_precio']
    )
    assert.deepEqual(
      body.products.map((p: any) => p.id),
      ids
    )
    const besign = body.products[1]
    assert.containsSubset(besign, {
      slug: BESIGN,
      priceTier: 'budget',
      scores: { ergonomia: 9, construccion: 9, portabilidad: 5, calidad_precio: 10 },
      goUrl: `/go/${ids[1]}?src=compare`,
    })
    for (const field of ['title', 'imageUrl', 'idealFor']) assert.isString(besign[field])
    assert.isArray(besign.pros)
    assert.isArray(besign.cons)
    assert.isObject(besign.keySpecs)
  })

  test('indica el mejor producto de cada criterio', async ({ client, assert }) => {
    await seed()
    const besign = await idOf(BESIGN)
    const tounee = await idOf(TOUNEE)

    const response = await client.get(`/api/compare?ids=${besign},${tounee}`)

    assert.deepEqual(response.body().bestByCriterion, {
      ergonomia: tounee,
      construccion: besign,
      portabilidad: tounee,
      calidad_precio: besign,
    })
  })

  test('rechaza comparar un solo producto o más de cuatro', async ({ client, assert }) => {
    await seed()
    const one = await client.get(`/api/compare?ids=${await idOf(BESIGN)}`)
    const ids = await db.from('products').limit(5).select('id')
    const five = await client.get(`/api/compare?ids=${ids.map((r) => r.id).join(',')}`)

    one.assertStatus(422)
    five.assertStatus(422)
    assert.include(JSON.stringify(one.body()), '2 a 4')
  })

  test('rechaza productos repetidos o identificadores mal formados', async ({ client }) => {
    await seed()
    const id = await idOf(BESIGN)

    const repeated = await client.get(`/api/compare?ids=${id},${id}`)
    const malformed = await client.get(`/api/compare?ids=${id},no-es-un-uuid`)

    repeated.assertStatus(422)
    malformed.assertStatus(422)
  })

  test('rechaza productos de categorías distintas', async ({ client, assert }) => {
    await seed()

    const response = await client.get(`/api/compare?ids=${await idOf(BESIGN)},${await idOf(F75)}`)

    response.assertStatus(422)
    assert.include(JSON.stringify(response.body()), 'misma categoría')
  })

  test('responde 404 si algún producto no está aprobado', async ({ client }) => {
    await seed()
    await db.from('products').where('slug', LAMICALL).update({ status: 'rejected' })

    const response = await client.get(
      `/api/compare?ids=${await idOf(BESIGN)},${await idOf(LAMICALL)}`
    )

    response.assertStatus(404)
  })
})
