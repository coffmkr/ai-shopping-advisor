import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import MainSeeder from '#database/seeders/main_seeder'
import AdminUser from '#models/admin_user'

async function seed() {
  await new MainSeeder(db.connection()).run()
  return AdminUser.query().firstOrFail()
}

async function candidate(asin: string) {
  return db.from('products').where('provider_product_id', asin).firstOrFail()
}

/** Ficha válida para un candidato de "Soportes para laptop". */
function laptopSheet(overrides: Record<string, unknown> = {}) {
  return {
    summary: 'Soporte plegable de aluminio, editado por el administrador antes de publicar.',
    idealFor: 'Trabajo en distintos lugares.',
    notFor: 'Escritorio fijo con laptop pesada.',
    pros: ['Plegable', 'Ligero'],
    cons: ['Algo de juego arriba'],
    scores: { ergonomia: 8, construccion: 7, portabilidad: 9, calidad_precio: 8 },
    keySpecs: { Material: 'Aluminio' },
    badges: ['best_value'],
    pairedProductIds: [],
    ...overrides,
  }
}

const NULAXY_LAPTOP = 'B077B9W343'
const K521 = 'B0DRFGNWV1'

test.group('Cola de revisión', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('sin sesión responde 401', async ({ client }) => {
    const response = await client.get('/api/admin/candidates')

    response.assertStatus(401)
  })

  test('por defecto lista solo los candidatos pendientes', async ({ client, assert }) => {
    const admin = await seed()

    const response = await client.get('/api/admin/candidates').loginAs(admin)

    response.assertStatus(200)
    const { data } = response.body()
    assert.lengthOf(data, 8)
    assert.isTrue(data.every((c: any) => c.status === 'pending'))
    assert.containsSubset(
      data.find((c: any) => c.asin === K521),
      {
        category: { slug: 'teclados-mecanicos' },
      }
    )
    for (const field of ['id', 'title', 'imageUrl', 'rating', 'reviewsCount']) {
      assert.property(data[0], field)
    }
  })

  test('el detalle trae el borrador, el precio de referencia y la rúbrica', async ({
    client,
    assert,
  }) => {
    const admin = await seed()
    const { id } = await candidate(NULAXY_LAPTOP)

    const response = await client.get(`/api/admin/candidates/${id}`).loginAs(admin)

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.asin, NULAXY_LAPTOP)
    assert.equal(body.referencePriceUsd, 19.99)
    assert.isString(body.draft.summary)
    assert.deepEqual(
      body.rubric.map((c: any) => c.key),
      ['ergonomia', 'construccion', 'portabilidad', 'calidad_precio']
    )
  })

  test('un candidato inexistente responde 404', async ({ client }) => {
    const admin = await seed()

    const response = await client
      .get('/api/admin/candidates/00000000-0000-4000-8000-999999999999')
      .loginAs(admin)

    response.assertStatus(404)
  })
})

test.group('Aprobar un candidato', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('publica la ficha editada y conserva el borrador original', async ({ client, assert }) => {
    const admin = await seed()
    const before = await candidate(NULAXY_LAPTOP)

    const response = await client
      .patch(`/api/admin/candidates/${before.id}`)
      .json({ action: 'approve', sheet: laptopSheet() })
      .loginAs(admin)

    response.assertStatus(200)
    assert.containsSubset(response.body(), { id: before.id, status: 'approved' })
    const after = await candidate(NULAXY_LAPTOP)
    assert.equal(after.status, 'approved')
    assert.equal(after.summary, laptopSheet().summary)
    assert.deepEqual(after.agent_draft, before.agent_draft)
    assert.equal(after.reviewed_by_id, admin.id)
    assert.isNotNull(after.reviewed_at)

    const listing = await client.get('/api/categories/soportes-laptop/products')
    assert.include(
      listing.body().products.map((p: any) => p.id),
      before.id
    )
  })

  test('genera el link con el tag de la tienda e ignora el tag del proveedor', async ({
    client,
    assert,
  }) => {
    const admin = await seed()
    const { id } = await candidate(NULAXY_LAPTOP)
    await db
      .from('products')
      .where('id', id)
      .update({
        provider_snapshot: JSON.stringify({
          url: `https://www.amazon.com/dp/${NULAXY_LAPTOP}?tag=otro-20`,
        }),
      })

    const response = await client
      .patch(`/api/admin/candidates/${id}`)
      .json({ action: 'approve', sheet: laptopSheet() })
      .loginAs(admin)

    response.assertStatus(200)
    const { affiliate_url: url } = await candidate(NULAXY_LAPTOP)
    assert.equal(url, `https://www.amazon.com/dp/${NULAXY_LAPTOP}?tag=zapyens-20`)
    assert.notInclude(url, 'otro-20')
  })

  test('guarda una nota por criterio y recalcula los rangos de precio', async ({
    client,
    assert,
  }) => {
    const admin = await seed()
    const { id } = await candidate(NULAXY_LAPTOP)

    await client
      .patch(`/api/admin/candidates/${id}`)
      .json({ action: 'approve', sheet: laptopSheet() })
      .loginAs(admin)

    const scores = await db.from('product_scores').where('product_id', id)
    assert.lengthOf(scores, 4)
    const category = await db.from('categories').where('slug', 'soportes-laptop').firstOrFail()
    const withoutTier = await db
      .from('products')
      .where({ category_id: category.id, status: 'approved' })
      .whereNull('price_tier')
    assert.lengthOf(withoutTier, 0)
  })

  test('rechaza una ficha a la que le falta una nota de la rúbrica', async ({ client, assert }) => {
    const admin = await seed()
    const { id } = await candidate(NULAXY_LAPTOP)

    const response = await client
      .patch(`/api/admin/candidates/${id}`)
      .json({
        action: 'approve',
        sheet: laptopSheet({ scores: { ergonomia: 8, construccion: 7, portabilidad: 9 } }),
      })
      .loginAs(admin)

    response.assertStatus(422)
    assert.include(JSON.stringify(response.body()), 'calidad_precio')
    assert.equal((await candidate(NULAXY_LAPTOP)).status, 'pending')
  })

  test('rechaza una nota de un criterio de otra categoría', async ({ client }) => {
    const admin = await seed()
    const { id } = await candidate(NULAXY_LAPTOP)

    const response = await client
      .patch(`/api/admin/candidates/${id}`)
      .json({
        action: 'approve',
        sheet: laptopSheet({
          scores: {
            ergonomia: 8,
            construccion: 7,
            portabilidad: 9,
            calidad_precio: 8,
            conectividad: 5,
          },
        }),
      })
      .loginAs(admin)

    response.assertStatus(422)
  })

  test('rechaza un resumen de menos de 20 caracteres', async ({ client, assert }) => {
    const admin = await seed()
    const { id } = await candidate(NULAXY_LAPTOP)

    const response = await client
      .patch(`/api/admin/candidates/${id}`)
      .json({ action: 'approve', sheet: laptopSheet({ summary: 'Muy corto' }) })
      .loginAs(admin)

    response.assertStatus(422)
    assert.equal((await candidate(NULAXY_LAPTOP)).status, 'pending')
  })
})

test.group('Rechazar un candidato', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('queda rechazado con su motivo y fuera de la cola y del catálogo', async ({
    client,
    assert,
  }) => {
    const admin = await seed()
    const { id } = await candidate(K521)

    const response = await client
      .patch(`/api/admin/candidates/${id}`)
      .json({ action: 'reject', reason: 'No es mecánico' })
      .loginAs(admin)

    response.assertStatus(200)
    const k521 = await candidate(K521)
    assert.equal(k521.status, 'rejected')
    assert.equal(k521.rejection_reason, 'No es mecánico')

    const queue = await client.get('/api/admin/candidates').loginAs(admin)
    assert.notInclude(
      queue.body().data.map((c: any) => c.id),
      id
    )
    const catalog = await client.get(`/api/products/${k521.slug}`)
    catalog.assertStatus(404)
  })

  test('un candidato ya revisado responde 409 y no cambia', async ({ client, assert }) => {
    const admin = await seed()
    const { id } = await candidate(K521)
    await client
      .patch(`/api/admin/candidates/${id}`)
      .json({ action: 'reject', reason: 'No es mecánico' })
      .loginAs(admin)

    const again = await client
      .patch(`/api/admin/candidates/${id}`)
      .json({ action: 'approve', sheet: laptopSheet() })
      .loginAs(admin)

    again.assertStatus(409)
    assert.equal((await candidate(K521)).status, 'rejected')
  })
})

/**
 * Sin transacción global: cada petición usa su propia conexión, así se prueba de
 * verdad el bloqueo de fila (SELECT … FOR UPDATE). La base se vacía al terminar.
 */
test.group('Aprobación concurrente', (group) => {
  group.each.teardown(async () => {
    const tables = await db
      .from('pg_tables')
      .where('schemaname', 'public')
      .whereNot('tablename', 'like', 'adonis_schema%')
      .select('tablename')
    await db.rawQuery(
      `TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(', ')} RESTART IDENTITY CASCADE`
    )
  })

  test('dos aprobaciones simultáneas del mismo candidato: una 200 y otra 409', async ({
    client,
    assert,
  }) => {
    const admin = await seed()
    const { id } = await candidate(NULAXY_LAPTOP)
    const approve = () =>
      client
        .patch(`/api/admin/candidates/${id}`)
        .json({ action: 'approve', sheet: laptopSheet() })
        .loginAs(admin)

    const responses = await Promise.all([approve(), approve()])

    assert.sameMembers(
      responses.map((r) => r.status()),
      [200, 409]
    )
    const scores = await db.from('product_scores').where('product_id', id)
    assert.lengthOf(scores, 4)
  })
})
