import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { readFile } from 'node:fs/promises'
import env from '#start/env'
import AdminUser from '#models/admin_user'
import AmazonAffiliateLinkBuilder from '#adapters/amazon/amazon_affiliate_link_builder'
import { mapProductDetail, mapSearchResults } from '#adapters/canopy/canopy_mapper'
import { assignPriceTiers } from '#services/price_tier'
import { CATEGORY_FIXTURES } from '#database/fixtures/categories'
import { SHEET_FIXTURES } from '#database/fixtures/catalog_seed'
import { CANDIDATE_FIXTURES } from '#database/fixtures/candidates_seed'

/**
 * Semilla reproducible e idempotente (upsert por claves naturales), sin red:
 * categorías y rúbricas, administrador de prueba, una búsqueda de origen
 * ficticia por categoría, 12 productos aprobados con ficha y 8 candidatos
 * pendientes con borrador (los candidatos nunca se sobrescriben: si el
 * administrador ya los revisó, la semilla respeta su decisión).
 */

/** UUID fijo de la búsqueda de origen de la semilla para cada categoría. */
function seedRunId(index: number) {
  return `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`
}

async function loadSearchItem(categorySlug: string, asin: string) {
  const url = new URL(`../fixtures/canopy/search-${categorySlug}.json`, import.meta.url)
  const raw = JSON.parse(await readFile(url, 'utf8'))
  const items: any[] = raw.data.amazonProductSearchResults.productResults.results
  const item = items.find((i) => i.asin === asin)
  const result = mapSearchResults({
    data: { amazonProductSearchResults: { productResults: { results: [item] } } },
  })[0]
  if (!item || !result) throw new Error(`La búsqueda grabada de ${categorySlug} no tiene ${asin}`)
  return { raw: item, result }
}

async function loadDetail(asin: string) {
  const url = new URL(`../fixtures/canopy/product-${asin}.json`, import.meta.url)
  const raw = JSON.parse(await readFile(url, 'utf8'))
  const detail = mapProductDetail(raw)
  if (!detail) throw new Error(`La fixture de ${asin} no tiene producto`)
  return { raw, detail }
}

export default class MainSeeder extends BaseSeeder {
  async run() {
    const db = this.client
    const now = new Date()
    const links = new AmazonAffiliateLinkBuilder(env.get('AMAZON_TAG'))

    // Administrador de prueba (la contraseña se guarda con hash)
    const admin = await AdminUser.updateOrCreate(
      { email: env.get('ADMIN_EMAIL') },
      { password: env.get('ADMIN_PASSWORD').release() },
      { client: db }
    )

    // Categorías, rúbricas y búsqueda de origen de la semilla
    const categoryIds: Record<string, string> = {}
    const criterionIds: Record<string, Record<string, string>> = {}

    for (const [index, category] of CATEGORY_FIXTURES.entries()) {
      const [row] = await db
        .table('categories')
        .insert({
          slug: category.slug,
          name: category.name,
          search_term: category.searchTerm,
          icon: category.icon,
          created_at: now,
        })
        .onConflict('slug')
        .merge(['name', 'search_term', 'icon'])
        .returning('id')
      categoryIds[category.slug] = row.id
      criterionIds[category.slug] = {}

      for (const [position, criterion] of category.criteria.entries()) {
        const [criterionRow] = await db
          .table('rubric_criteria')
          .insert({
            category_id: row.id,
            key: criterion.key,
            label: criterion.label,
            position: position + 1,
          })
          .onConflict(['category_id', 'key'])
          .merge(['label', 'position'])
          .returning('id')
        criterionIds[category.slug][criterion.key] = criterionRow.id
      }

      await db
        .table('agent_runs')
        .insert({
          id: seedRunId(index),
          category_id: row.id,
          requested_by_id: admin.id,
          status: 'completed',
          is_seed: true,
          provider_requests: 0,
          candidates_created:
            SHEET_FIXTURES.filter((s) => s.categorySlug === category.slug).length +
            CANDIDATE_FIXTURES.filter((c) => c.categorySlug === category.slug).length,
          created_at: now,
          started_at: now,
          finished_at: now,
        })
        .onConflict('id')
        .merge(['candidates_created'])
    }

    // Rango de precio por terciles dentro de cada categoría
    const details = new Map(
      await Promise.all(
        SHEET_FIXTURES.map(async (sheet) => [sheet.asin, await loadDetail(sheet.asin)] as const)
      )
    )
    const tiers: Record<string, string> = {}
    for (const category of CATEGORY_FIXTURES) {
      Object.assign(
        tiers,
        assignPriceTiers(
          SHEET_FIXTURES.filter((s) => s.categorySlug === category.slug).map((s) => ({
            id: s.asin,
            priceUsd: details.get(s.asin)!.detail.priceUsd,
          }))
        )
      )
    }

    // Productos aprobados con su ficha
    const productIds: Record<string, string> = {}
    for (const sheet of SHEET_FIXTURES) {
      const { raw, detail } = details.get(sheet.asin)!
      const categoryIndex = CATEGORY_FIXTURES.findIndex((c) => c.slug === sheet.categorySlug)
      const draft = {
        summary: sheet.summary,
        idealFor: sheet.idealFor,
        notFor: sheet.notFor,
        pros: sheet.pros,
        cons: sheet.cons,
        scores: sheet.scores,
        keySpecs: sheet.keySpecs,
      }

      const values = {
        provider: 'amazon',
        provider_product_id: sheet.asin,
        slug: sheet.slug,
        category_id: categoryIds[sheet.categorySlug],
        agent_run_id: seedRunId(categoryIndex),
        reviewed_by_id: admin.id,
        title: sheet.title,
        brand: detail.brand,
        image_url: detail.imageUrl,
        rating: detail.rating ?? 0,
        reviews_count: detail.reviewsCount ?? 0,
        reference_price_usd: detail.priceUsd,
        price_tier: tiers[sheet.asin] ?? null,
        key_specs: JSON.stringify(sheet.keySpecs),
        provider_snapshot: JSON.stringify(raw),
        data_updated_at: now,
        agent_draft: JSON.stringify(draft),
        summary: sheet.summary,
        ideal_for: sheet.idealFor,
        not_for: sheet.notFor,
        pros: JSON.stringify(sheet.pros),
        cons: JSON.stringify(sheet.cons),
        badges: JSON.stringify(sheet.badges),
        status: 'approved',
        affiliate_url: links.build(sheet.asin),
        reviewed_at: now,
        created_at: now,
      }
      const [row] = await db
        .table('products')
        .insert(values)
        .onConflict(['provider', 'provider_product_id'])
        .merge(Object.keys(values).filter((key) => key !== 'created_at'))
        .returning('id')
      productIds[sheet.asin] = row.id

      for (const [key, score] of Object.entries(sheet.scores)) {
        await db
          .table('product_scores')
          .insert({
            product_id: row.id,
            criterion_id: criterionIds[sheet.categorySlug][key],
            score,
          })
          .onConflict(['product_id', 'criterion_id'])
          .merge(['score'])
      }
    }

    // "Combina bien con"
    for (const sheet of SHEET_FIXTURES) {
      for (const pairedAsin of sheet.pairsWith) {
        await db
          .table('product_pairings')
          .insert({ product_id: productIds[sheet.asin], paired_product_id: productIds[pairedAsin] })
          .onConflict(['product_id', 'paired_product_id'])
          .ignore()
      }
    }

    // Candidatos pendientes (solo se insertan si no existen)
    for (const candidate of CANDIDATE_FIXTURES) {
      const { raw, result } = await loadSearchItem(candidate.categorySlug, candidate.asin)
      const categoryIndex = CATEGORY_FIXTURES.findIndex((c) => c.slug === candidate.categorySlug)
      await db
        .table('products')
        .insert({
          provider: 'amazon',
          provider_product_id: candidate.asin,
          slug: candidate.slug,
          category_id: categoryIds[candidate.categorySlug],
          agent_run_id: seedRunId(categoryIndex),
          title: result.title.slice(0, 500),
          brand: result.brand,
          image_url: result.imageUrl,
          rating: result.rating ?? 0,
          reviews_count: result.reviewsCount ?? 0,
          reference_price_usd: result.priceUsd,
          key_specs: JSON.stringify(candidate.draft.keySpecs),
          provider_snapshot: JSON.stringify(raw),
          data_updated_at: now,
          agent_draft: JSON.stringify(candidate.draft),
          status: 'pending',
          created_at: now,
        })
        .onConflict(['provider', 'provider_product_id'])
        .ignore()
    }
  }
}
