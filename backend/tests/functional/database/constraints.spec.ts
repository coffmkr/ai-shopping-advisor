import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import {
  approvedSheet,
  insertAdmin,
  insertAgentRun,
  insertCategory,
  insertCriterion,
  insertProduct,
} from '#tests/helpers/factories'

async function context() {
  const adminId = await insertAdmin()
  const categoryId = await insertCategory()
  const agentRunId = await insertAgentRun(categoryId, adminId)
  return { adminId, categoryId, agentRunId }
}

test.group('Restricciones del esquema', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('no permite dos productos con el mismo proveedor y ASIN', async ({ assert }) => {
    const { categoryId, agentRunId } = await context()
    await insertProduct(categoryId, agentRunId, { provider_product_id: 'B000000001' })

    await assert.rejects(() =>
      insertProduct(categoryId, agentRunId, {
        provider_product_id: 'B000000001',
        slug: 'otro-slug',
      })
    )
  })

  test('rechaza un ASIN que no tiene 10 caracteres alfanuméricos en mayúsculas', async ({
    assert,
  }) => {
    const { categoryId, agentRunId } = await context()

    await assert.rejects(() =>
      insertProduct(categoryId, agentRunId, { provider_product_id: 'B00000001' })
    )
    await assert.rejects(() =>
      insertProduct(categoryId, agentRunId, { provider_product_id: 'b000000001' })
    )
  })

  test('rechaza una nota fuera del rango 0 a 10', async ({ assert }) => {
    const { categoryId, agentRunId } = await context()
    const productId = await insertProduct(categoryId, agentRunId)
    const criterionId = await insertCriterion(categoryId, 'ergonomia')

    await assert.rejects(() =>
      db
        .table('product_scores')
        .insert({ product_id: productId, criterion_id: criterionId, score: 11 })
    )
  })

  test('no permite aprobar un producto sin link de afiliado o sin resumen', async ({ assert }) => {
    const { categoryId, agentRunId } = await context()

    await assert.rejects(() =>
      insertProduct(categoryId, agentRunId, { ...approvedSheet(), affiliate_url: null })
    )
    await assert.rejects(() =>
      insertProduct(categoryId, agentRunId, { ...approvedSheet(), summary: null })
    )
  })

  test('acepta un producto aprobado con la ficha completa', async ({ assert }) => {
    const { categoryId, agentRunId } = await context()

    const id = await insertProduct(categoryId, agentRunId, approvedSheet())

    assert.isString(id)
  })

  test('no permite que un producto se combine consigo mismo', async ({ assert }) => {
    const { categoryId, agentRunId } = await context()
    const productId = await insertProduct(categoryId, agentRunId)

    await assert.rejects(() =>
      db
        .table('product_pairings')
        .insert({ product_id: productId, paired_product_id: productId })
    )
  })

  test('no permite dos búsquedas activas en la misma categoría', async ({ assert }) => {
    const { adminId, categoryId } = await context()
    await insertAgentRun(categoryId, adminId, { status: 'queued' })

    await assert.rejects(() => insertAgentRun(categoryId, adminId, { status: 'running' }))
  })

  test('permite una búsqueda activa si las otras de la categoría ya terminaron', async ({
    assert,
  }) => {
    const { adminId, categoryId } = await context()
    await insertAgentRun(categoryId, adminId, { status: 'failed' })

    const id = await insertAgentRun(categoryId, adminId, { status: 'queued' })

    assert.isString(id)
  })

  test('no permite borrar una categoría que tiene productos', async ({ assert }) => {
    const { categoryId, agentRunId } = await context()
    await insertProduct(categoryId, agentRunId)

    await assert.rejects(() => db.from('categories').where('id', categoryId).delete())
  })
})
