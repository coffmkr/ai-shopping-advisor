import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import MainSeeder from '#database/seeders/main_seeder'
import AdminUser from '#models/admin_user'
import { JobQueue } from '#ports/job_queue'
import { FakeJobQueue } from '#tests/helpers/fakes'
import env from '#start/env'

async function seed() {
  await new MainSeeder(db.connection()).run()
  return AdminUser.query().firstOrFail()
}

async function categoryId(slug: string) {
  const row = await db.from('categories').where('slug', slug).firstOrFail()
  return row.id as string
}

test.group('Lanzar búsquedas del agente', (group) => {
  let queue: FakeJobQueue
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => {
    queue = new FakeJobQueue()
    app.container.swap(JobQueue, () => queue)
    return () => app.container.restore(JobQueue)
  })

  test('acepta la búsqueda, responde 202 en queued y la encola', async ({ client, assert }) => {
    const admin = await seed()

    const response = await client
      .post('/api/admin/agent-runs')
      .json({ categoryId: await categoryId('soportes-laptop'), maxPriceUsd: 40 })
      .loginAs(admin)

    response.assertStatus(202)
    const run = response.body() as any
    assert.containsSubset(run, { status: 'queued', maxPriceUsd: 40, candidatesCreated: 0 })
    assert.deepEqual(queue.enqueued, [run.id])
  })

  test('sin sesión responde 401', async ({ client }) => {
    const response = await client.post('/api/admin/agent-runs').json({})

    response.assertStatus(401)
  })

  test('una categoría inexistente responde 404', async ({ client }) => {
    const admin = await seed()

    const response = await client
      .post('/api/admin/agent-runs')
      .json({ categoryId: '00000000-0000-4000-8000-999999999999' })
      .loginAs(admin)

    response.assertStatus(404)
  })

  test('un precio máximo fuera de rango responde 422', async ({ client }) => {
    const admin = await seed()

    const response = await client
      .post('/api/admin/agent-runs')
      .json({ categoryId: await categoryId('soportes-laptop'), maxPriceUsd: 5000 })
      .loginAs(admin)

    response.assertStatus(422)
  })

  test('con otra búsqueda activa en la categoría responde 409', async ({ client, assert }) => {
    const admin = await seed()
    const laptop = await categoryId('soportes-laptop')
    await client.post('/api/admin/agent-runs').json({ categoryId: laptop }).loginAs(admin)

    const second = await client
      .post('/api/admin/agent-runs')
      .json({ categoryId: laptop })
      .loginAs(admin)

    second.assertStatus(409)
    assert.equal((second.body() as any).message, 'Ya hay una búsqueda en curso para esta categoría')
    assert.lengthOf(queue.enqueued, 1)
  })

  test('en otra categoría se acepta aunque haya una activa', async ({ client }) => {
    const admin = await seed()
    await client
      .post('/api/admin/agent-runs')
      .json({ categoryId: await categoryId('soportes-laptop') })
      .loginAs(admin)

    const other = await client
      .post('/api/admin/agent-runs')
      .json({ categoryId: await categoryId('desk-pads') })
      .loginAs(admin)

    other.assertStatus(202)
  })

  test('al superar el límite diario responde 429, sin contar la semilla', async ({ client }) => {
    const admin = await seed()
    const laptop = await categoryId('soportes-laptop')
    // El límite de pruebas es CANOPY_MAX_SEARCHES_PER_DAY; se simulan búsquedas terminadas hoy
    const limit = env.get('CANOPY_MAX_SEARCHES_PER_DAY')
    for (let i = 0; i < limit; i++) {
      await db.table('agent_runs').insert({
        category_id: laptop,
        requested_by_id: admin.id,
        status: 'completed',
        created_at: new Date(),
      })
    }

    const response = await client
      .post('/api/admin/agent-runs')
      .json({ categoryId: await categoryId('desk-pads') })
      .loginAs(admin)

    response.assertStatus(429)
  })

  test('lista las búsquedas con su categoría y devuelve el detalle', async ({ client, assert }) => {
    const admin = await seed()
    const created = await client
      .post('/api/admin/agent-runs')
      .json({ categoryId: await categoryId('desk-pads') })
      .loginAs(admin)
    const runId = (created.body() as any).id

    const list = await client.get('/api/admin/agent-runs').loginAs(admin)
    const detail = await client.get(`/api/admin/agent-runs/${runId}`).loginAs(admin)

    list.assertStatus(200)
    const runs = (list.body() as any).data
    assert.equal(runs[0].id, runId)
    assert.deepEqual(runs[0].category, { slug: 'desk-pads', name: 'Desk pads' })
    detail.assertStatus(200)
    assert.equal((detail.body() as any).status, 'queued')
  })
})
