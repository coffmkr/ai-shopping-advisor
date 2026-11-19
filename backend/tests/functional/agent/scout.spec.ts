import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import MainSeeder from '#database/seeders/main_seeder'
import AdminUser from '#models/admin_user'
import ScoutService from '#services/scout_service'
import { CatalogProvider, CatalogProviderError } from '#ports/catalog_provider'
import { LlmClient } from '#ports/llm_client'
import BasicDraftLlmClient, { BASIC_DRAFT_PREFIX } from '#adapters/llm/basic_draft_llm_client'
import { FakeLlmClient, FixtureCatalogProvider, validDraft } from '#tests/helpers/fakes'

async function queuedRun(maxPriceUsd: number | null = 40) {
  await new MainSeeder(db.connection()).run()
  const admin = await AdminUser.query().firstOrFail()
  const category = await db.from('categories').where('slug', 'soportes-laptop').firstOrFail()
  const [row] = await db
    .table('agent_runs')
    .insert({
      category_id: category.id,
      requested_by_id: admin.id,
      max_price_usd: maxPriceUsd,
      status: 'queued',
      created_at: new Date(),
    })
    .returning('id')
  return row.id as string
}

async function runScout(id: string, provider: CatalogProvider, llm: LlmClient) {
  app.container.swap(CatalogProvider, () => provider)
  app.container.swap(LlmClient, () => llm)
  try {
    const scout = await app.container.make(ScoutService)
    await scout.run(id)
  } finally {
    app.container.restoreAll([CatalogProvider, LlmClient])
  }
}

test.group('Agente buscador', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('crea candidatos pendientes filtrados con su borrador y termina completed', async ({
    assert,
  }) => {
    const id = await queuedRun(40)
    const llm = new FakeLlmClient()

    await runScout(id, new FixtureCatalogProvider(), llm)

    const run = await db.from('agent_runs').where('id', id).firstOrFail()
    const candidates = await db.from('products').where('agent_run_id', id)
    assert.equal(run.status, 'completed')
    assert.isNotNull(run.finished_at)
    assert.isAbove(candidates.length, 0)
    assert.isAtMost(candidates.length, 4)
    assert.equal(run.candidates_created, candidates.length)
    assert.equal(run.provider_requests, 1 + llm.requests.length)
    for (const candidate of candidates) {
      assert.equal(candidate.status, 'pending')
      assert.isAtMost(Number(candidate.reference_price_usd), 40)
      assert.isString(candidate.agent_draft.summary)
      assert.isNull(candidate.affiliate_url)
    }
  })

  test('no repite productos que ya existen (aprobados, pendientes o rechazados)', async ({
    assert,
  }) => {
    const id = await queuedRun(40)
    const llm = new FakeLlmClient()

    await runScout(id, new FixtureCatalogProvider(), llm)

    const asked = llm.requests.map((r) => r.product.asin)
    for (const existing of ['B08BRCT4JH', 'B08M94BTYC', 'B077B9W343', 'B08G84P8ZX']) {
      assert.notInclude(asked, existing)
    }
  })

  test('descarta borradores de otro ASIN o con criterios ajenos a la rúbrica', async ({
    assert,
  }) => {
    const probe = new FakeLlmClient()
    const probeId = await queuedRun(40)
    await runScout(probeId, new FixtureCatalogProvider(), probe)
    const [first, second] = probe.requests.map((r) => r.product.asin)
    await db.from('products').where('agent_run_id', probeId).delete()
    await db.from('agent_runs').where('id', probeId).delete()

    const id = await queuedRun(40)
    const llm = new FakeLlmClient({
      [first]: (req) => ({ ...validDraft(req), asin: 'B0INVENTAD' }),
      [second]: (req) => ({
        ...validDraft(req),
        scores: { ...validDraft(req).scores, conectividad: 5 },
      }),
    })
    await runScout(id, new FixtureCatalogProvider(), llm)

    const rows = await db.from('products').where('agent_run_id', id)
    const created = rows.map((p) => p.provider_product_id)
    assert.notInclude(created, first)
    assert.notInclude(created, second)
    assert.equal(created.length, llm.requests.length - 2)
  })

  test('si el proveedor falla queda failed sin candidatos', async ({ assert }) => {
    const id = await queuedRun(40)

    await runScout(
      id,
      new FixtureCatalogProvider(
        'search-soportes-laptop.json',
        new CatalogProviderError('Canopy no responde', true)
      ),
      new FakeLlmClient()
    )

    const run = await db.from('agent_runs').where('id', id).firstOrFail()
    assert.equal(run.status, 'failed')
    assert.include(run.error_message, 'proveedor de datos')
    assert.lengthOf(await db.from('products').where('agent_run_id', id), 0)
  })

  test('sin clave de Claude crea candidatos con un borrador básico', async ({ assert }) => {
    const id = await queuedRun(40)

    await runScout(id, new FixtureCatalogProvider(), new BasicDraftLlmClient())

    const candidates = await db.from('products').where('agent_run_id', id)
    assert.isAbove(candidates.length, 0)
    for (const candidate of candidates) {
      assert.isTrue(candidate.agent_draft.summary.startsWith(BASIC_DRAFT_PREFIX))
    }
  })

  test('una búsqueda que ya no está en queued no se vuelve a ejecutar', async ({ assert }) => {
    const id = await queuedRun(40)
    await db.from('agent_runs').where('id', id).update({ status: 'completed' })
    const provider = new FixtureCatalogProvider()

    await runScout(id, provider, new FakeLlmClient())

    assert.equal(provider.calls, 0)
  })
})
