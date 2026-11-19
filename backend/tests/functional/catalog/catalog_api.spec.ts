import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import MainSeeder from '#database/seeders/main_seeder'
import { insertProduct } from '#tests/helpers/factories'

async function seed() {
  await new MainSeeder(db.connection()).run()
}

async function categoryContext(slug: string) {
  const category = await db.from('categories').where('slug', slug).firstOrFail()
  const run = await db.from('agent_runs').where('category_id', category.id).firstOrFail()
  return { categoryId: category.id as string, agentRunId: run.id as string }
}

async function productBySlug(slug: string) {
  return db.from('products').where('slug', slug).firstOrFail()
}

test.group('API pública del catálogo', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('lista las categorías con su número de productos aprobados y destacados', async ({
    client,
    assert,
  }) => {
    await seed()

    const response = await client.get('/api/categories')

    response.assertStatus(200)
    const { categories, featured } = response.body()
    assert.lengthOf(categories, 4)
    assert.isString(categories[0].id)
    assert.containsSubset(categories, [
      {
        slug: 'soportes-laptop',
        name: 'Soportes para laptop',
        icon: 'laptop',
        productCount: 3,
      },
    ])
    assert.lengthOf(featured, 4)
    assert.equal(new Set(featured.map((p: any) => p.categorySlug)).size, 4)
  })

  test('el listado de una categoría solo trae aprobados, con mejor nota primero', async ({
    client,
    assert,
  }) => {
    await seed()
    const { categoryId, agentRunId } = await categoryContext('soportes-laptop')
    await insertProduct(categoryId, agentRunId, { slug: 'pendiente', title: 'Pendiente' })
    await insertProduct(categoryId, agentRunId, {
      slug: 'rechazado',
      title: 'Rechazado',
      status: 'rejected',
    })

    const response = await client.get('/api/categories/soportes-laptop/products')

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.category.name, 'Soportes para laptop')
    assert.deepEqual(
      body.criteria.map((c: any) => c.key),
      ['ergonomia', 'construccion', 'portabilidad', 'calidad_precio']
    )
    assert.lengthOf(body.products, 3)
    assert.notIncludeMembers(
      body.products.map((p: any) => p.slug),
      ['pendiente', 'rechazado']
    )
    const averages = body.products.map((p: any) => p.averageScore)
    assert.deepEqual(
      averages,
      [...averages].sort((a: number, b: number) => b - a)
    )

    const card = body.products.find((p: any) => p.slug === 'besign-ls03-soporte-laptop-aluminio')
    assert.containsSubset(card, {
      priceTier: 'budget',
      scores: { ergonomia: 9, construccion: 9, portabilidad: 5, calidad_precio: 10 },
      badges: ['best_value', 'editor_choice'],
      goUrl: `/go/${card.id}?src=listing`,
    })
    assert.isString(card.imageUrl)
    assert.isString(card.summary)
  })

  test('una categoría inexistente responde 404', async ({ client }) => {
    await seed()

    const response = await client.get('/api/categories/no-existe/products')

    response.assertStatus(404)
  })

  test('la ficha de un producto aprobado trae todos sus bloques', async ({ client, assert }) => {
    await seed()

    const response = await client.get('/api/products/lamicall-soporte-laptop-ajustable')

    response.assertStatus(200)
    const { product } = response.body()
    assert.containsSubset(product, {
      title: 'Lamicall — soporte ajustable para laptop',
      brand: 'Lamicall',
      priceTier: 'mid',
      category: { slug: 'soportes-laptop', name: 'Soportes para laptop' },
      scores: { ergonomia: 9, construccion: 8, portabilidad: 7, calidad_precio: 8 },
    })
    for (const field of ['summary', 'idealFor', 'notFor', 'imageUrl', 'reviewedAt', 'goUrl']) {
      assert.isString(product[field], field)
    }
    assert.isAbove(product.pros.length, 0)
    assert.isAbove(product.cons.length, 0)
    assert.isAbove(Object.keys(product.keySpecs).length, 0)
    assert.lengthOf(product.criteria, 4)
    assert.equal(product.goUrl, `/go/${product.id}?src=detail`)
  })

  test('la ficha de rango medio ofrece una alternativa económica y una premium', async ({
    client,
    assert,
  }) => {
    await seed()

    const response = await client.get('/api/products/lamicall-soporte-laptop-ajustable')

    const tiers = response.body().alternatives.map((p: any) => p.priceTier)
    assert.sameMembers(tiers, ['budget', 'premium'])
  })

  test('"combina bien con" no muestra productos no aprobados', async ({ client, assert }) => {
    await seed()
    await db
      .from('products')
      .where('slug', 'aula-f75-teclado-mecanico-inalambrico')
      .update({ status: 'rejected' })

    const response = await client.get('/api/products/besign-ls03-soporte-laptop-aluminio')

    const slugs = response.body().pairings.map((p: any) => p.slug)
    assert.include(slugs, 'ysagi-desk-pad-cuero-grande')
    assert.notInclude(slugs, 'aula-f75-teclado-mecanico-inalambrico')
  })

  test('la ficha de un producto no aprobado responde 404', async ({ client }) => {
    await seed()
    const { categoryId, agentRunId } = await categoryContext('desk-pads')
    await insertProduct(categoryId, agentRunId, { slug: 'candidato-pendiente' })

    const response = await client.get('/api/products/candidato-pendiente')

    response.assertStatus(404)
  })

  test('las respuestas públicas nunca exponen datos internos', async ({ client, assert }) => {
    await seed()

    const responses = await Promise.all([
      client.get('/api/categories'),
      client.get('/api/categories/soportes-laptop/products'),
      client.get('/api/products/besign-ls03-soporte-laptop-aluminio'),
    ])

    for (const response of responses) {
      const text = JSON.stringify(response.body())
      for (const forbidden of [
        'affiliateUrl',
        'affiliate_url',
        'referencePriceUsd',
        'reference_price_usd',
        'providerSnapshot',
        'agentDraft',
        'amazon.com/dp',
        'superlink092-20',
        'zapyens-20',
      ]) {
        assert.notInclude(text, forbidden)
      }
    }
  })
})

test.group('Redirección a Amazon con clic registrado', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('redirige con el link de afiliado y registra el clic con su origen', async ({
    client,
    assert,
  }) => {
    await seed()
    const product = await productBySlug('besign-ls03-soporte-laptop-aluminio')

    const response = await client.get(`/go/${product.id}?src=detail`).redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', 'https://www.amazon.com/dp/B08BRCT4JH?tag=zapyens-20')
    const clicks = await db.from('click_events').where('product_id', product.id)
    assert.lengthOf(clicks, 1)
    assert.equal(clicks[0].source, 'detail')
    assert.isNull(clicks[0].visitor_hash)
  })

  test('rechaza un origen inválido sin registrar el clic', async ({ client, assert }) => {
    await seed()
    const product = await productBySlug('besign-ls03-soporte-laptop-aluminio')

    const response = await client.get(`/go/${product.id}?src=foo`).redirects(0)

    response.assertStatus(422)
    assert.lengthOf(await db.from('click_events'), 0)
  })

  test('responde 404 para un producto no aprobado sin registrar el clic', async ({
    client,
    assert,
  }) => {
    await seed()
    const { categoryId, agentRunId } = await categoryContext('desk-pads')
    const pendingId = await insertProduct(categoryId, agentRunId, {
      affiliate_url: 'https://www.amazon.com/dp/B0TEST9999?tag=zapyens-20',
    })

    const response = await client.get(`/go/${pendingId}?src=detail`).redirects(0)

    response.assertStatus(404)
    assert.lengthOf(await db.from('click_events'), 0)
  })

  test('responde 404 para un identificador que no es un UUID', async ({ client }) => {
    const response = await client.get('/go/no-es-un-uuid?src=detail').redirects(0)

    response.assertStatus(404)
  })
})
