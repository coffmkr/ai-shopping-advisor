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
    assert.equal(await count('products'), 12)
    assert.equal(await count('agent_runs'), 4)
    assert.equal(await count('product_scores'), 48)
  })
})
