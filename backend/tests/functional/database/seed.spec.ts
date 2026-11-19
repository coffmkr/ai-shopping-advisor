import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import MainSeeder from '#database/seeders/main_seeder'

async function runSeed() {
  await new MainSeeder(db.connection()).run()
}

async function count(table: string, where: Record<string, unknown> = {}) {
  const [row] = await db.from(table).where(where).count('* as total')
  return Number(row.total)
}

test.group('Semilla de productos de ejemplo', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('carga 4 categorías con su rúbrica y 12 productos aprobados', async ({ assert }) => {
    await runSeed()

    assert.equal(await count('categories'), 4)
    assert.equal(await count('rubric_criteria'), 16)
    assert.equal(await count('products', { status: 'approved' }), 12)
    assert.equal(await count('admin_users'), 1)
  })

  test('cada producto aprobado tiene una nota por criterio de su categoría', async ({ assert }) => {
    await runSeed()

    const rows = await db
      .from('products as p')
      .join('rubric_criteria as rc', 'rc.category_id', 'p.category_id')
      .leftJoin('product_scores as ps', (join) => {
        join.on('ps.product_id', 'p.id').andOn('ps.criterion_id', 'rc.id')
      })
      .where('p.status', 'approved')
      .whereNull('ps.score')
      .select('p.slug', 'rc.key')

    assert.deepEqual(rows, [])
  })

  test('el link de afiliado lleva el tag de la tienda y nunca el del proveedor', async ({
    assert,
  }) => {
    await runSeed()

    const links = await db.from('products').where('status', 'approved').select('affiliate_url')
    for (const { affiliate_url: url } of links) {
      assert.match(url, /^https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]{10}\?tag=zapyens-20$/)
      assert.notInclude(url, 'superlink092-20')
    }
  })

  test('cada producto cuelga de una búsqueda de origen marcada como semilla', async ({
    assert,
  }) => {
    await runSeed()

    const orphans = await db
      .from('products as p')
      .join('agent_runs as ar', 'ar.id', 'p.agent_run_id')
      .where('ar.is_seed', false)
      .count('* as total')

    assert.equal(Number(orphans[0].total), 0)
    assert.equal(await count('agent_runs', { is_seed: true }), 4)
  })

  test('asigna un rango de precio a cada producto aprobado', async ({ assert }) => {
    await runSeed()

    assert.equal(await count('products', { status: 'approved', price_tier: null }), 0)
  })

  test('ejecutarla dos veces deja el mismo resultado', async ({ assert }) => {
    await runSeed()
    await runSeed()

    assert.equal(await count('categories'), 4)
    assert.equal(await count('rubric_criteria'), 16)
    assert.equal(await count('products'), 20)
    assert.equal(await count('agent_runs'), 4)
    assert.equal(await count('product_scores'), 48)
  })
})

test.group('Candidatos pendientes de la semilla', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('incluye 2 candidatos pendientes por categoría con borrador y origen de semilla', async ({
    assert,
  }) => {
    await runSeed()

    const pending = await db
      .from('products as p')
      .join('agent_runs as ar', 'ar.id', 'p.agent_run_id')
      .join('categories as c', 'c.id', 'p.category_id')
      .where('p.status', 'pending')
      .select('c.slug', 'p.agent_draft', 'ar.is_seed', 'p.affiliate_url', 'p.summary')

    assert.lengthOf(pending, 8)
    for (const slug of ['soportes-laptop', 'soportes-celular', 'teclados-mecanicos', 'desk-pads']) {
      assert.lengthOf(
        pending.filter((p) => p.slug === slug),
        2,
        slug
      )
    }
    for (const candidate of pending) {
      assert.isTrue(candidate.is_seed)
      assert.isNull(candidate.affiliate_url)
      assert.isNull(candidate.summary)
      assert.isString(candidate.agent_draft.summary)
      assert.isObject(candidate.agent_draft.scores)
    }
  })

  test('no reabre un candidato que el administrador ya revisó', async ({ assert }) => {
    await runSeed()
    await db
      .from('products')
      .where('provider_product_id', 'B0DRFGNWV1')
      .update({ status: 'rejected', rejection_reason: 'No es mecánico' })

    await runSeed()

    const k521 = await db.from('products').where('provider_product_id', 'B0DRFGNWV1').firstOrFail()
    assert.equal(k521.status, 'rejected')
    assert.equal(k521.rejection_reason, 'No es mecánico')
  })
})
