import db from '@adonisjs/lucid/services/db'
import { randomUUID } from 'node:crypto'

/**
 * Inserciones mínimas y explícitas para los tests. Se usan inserciones en bruto
 * para probar las restricciones de la base de datos sin pasar por los modelos.
 */

let asinCounter = 0
export function nextAsin() {
  asinCounter++
  return `B0TEST${String(asinCounter).padStart(4, '0')}`
}

export async function insertAdmin(email = `admin-${randomUUID()}@test.test`) {
  const [row] = await db
    .table('admin_users')
    .insert({ email, password: 'hash-de-prueba', created_at: new Date() })
    .returning('id')
  return row.id as string
}

export async function insertCategory(slug = `cat-${randomUUID().slice(0, 8)}`) {
  const [row] = await db
    .table('categories')
    .insert({ slug, name: `Categoría ${slug}`, search_term: slug, created_at: new Date() })
    .returning('id')
  return row.id as string
}

export async function insertCriterion(categoryId: string, key: string, position = 1) {
  const [row] = await db
    .table('rubric_criteria')
    .insert({ category_id: categoryId, key, label: key, position })
    .returning('id')
  return row.id as string
}

export async function insertAgentRun(
  categoryId: string,
  adminId: string,
  overrides: Record<string, unknown> = {}
) {
  const [row] = await db
    .table('agent_runs')
    .insert({
      category_id: categoryId,
      requested_by_id: adminId,
      status: 'completed',
      created_at: new Date(),
      ...overrides,
    })
    .returning('id')
  return row.id as string
}

export function approvedSheet() {
  return {
    status: 'approved',
    summary: 'Resumen suficientemente largo para la ficha de prueba.',
    ideal_for: 'Ideal para pruebas.',
    not_for: 'No es para producción.',
    pros: JSON.stringify(['Pro de prueba']),
    cons: JSON.stringify(['Contra de prueba']),
    affiliate_url: 'https://www.amazon.com/dp/B0TEST0000?tag=zapyens-20',
    reviewed_at: new Date(),
  }
}

export async function insertProduct(
  categoryId: string,
  agentRunId: string,
  overrides: Record<string, unknown> = {}
) {
  const asin = (overrides.provider_product_id as string) ?? nextAsin()
  const [row] = await db
    .table('products')
    .insert({
      provider: 'amazon',
      provider_product_id: asin,
      slug: `producto-${asin.toLowerCase()}`,
      category_id: categoryId,
      agent_run_id: agentRunId,
      title: `Producto ${asin}`,
      rating: 4.5,
      reviews_count: 100,
      key_specs: JSON.stringify({}),
      provider_snapshot: JSON.stringify({}),
      agent_draft: JSON.stringify({}),
      data_updated_at: new Date(),
      created_at: new Date(),
      ...overrides,
    })
    .returning('id')
  return row.id as string
}
