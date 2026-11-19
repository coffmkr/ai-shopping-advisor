import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import env from '#start/env'
import Product from '#models/product'
import RubricCriterion from '#models/rubric_criterion'
import AmazonAffiliateLinkBuilder from '#adapters/amazon/amazon_affiliate_link_builder'
import type { AffiliateLinkBuilder } from '#ports/affiliate_link_builder'
import { assignPriceTiers } from '#services/price_tier'
import type { ProductStatus } from '#models/types'
import type { SheetInput } from '#validators/review'

export class CandidateNotFoundError extends Error {}
export class CandidateAlreadyReviewedError extends Error {}
export class SheetRubricError extends Error {
  constructor(readonly errors: Array<{ field: string; message: string }>) {
    super('La ficha no cumple la rúbrica de la categoría')
  }
}

/**
 * Revisión de candidatos por el administrador. Aprobar y rechazar ocurren en una
 * transacción con la fila bloqueada (SELECT … FOR UPDATE): dos decisiones
 * simultáneas sobre el mismo candidato se serializan y la segunda recibe 409.
 * Aprobar no llama a ningún servicio externo.
 */
@inject()
export default class ReviewService {
  private readonly links: AffiliateLinkBuilder

  constructor() {
    this.links = new AmazonAffiliateLinkBuilder(env.get('AMAZON_TAG'))
  }

  async listCandidates(filters: { status: ProductStatus; agentRunId?: string }) {
    const query = Product.query()
      .where('status', filters.status)
      .preload('category')
      .orderBy('created_at', 'desc')
      .orderBy('title')
    if (filters.agentRunId) query.where('agent_run_id', filters.agentRunId)
    const candidates = await query

    return candidates.map((c) => ({
      id: c.id,
      asin: c.asin,
      title: c.title,
      brand: c.brand,
      imageUrl: c.imageUrl,
      rating: Number(c.rating),
      reviewsCount: c.reviewsCount,
      status: c.status,
      agentRunId: c.agentRunId,
      category: { slug: c.category.slug, name: c.category.name },
      createdAt: c.createdAt.toISO(),
    }))
  }

  async getCandidate(id: string) {
    const candidate = await Product.query()
      .where('id', id)
      .preload('category', (q) => q.preload('criteria', (c) => c.orderBy('position')))
      .first()
    if (!candidate) return null

    return {
      id: candidate.id,
      status: candidate.status,
      asin: candidate.asin,
      title: candidate.title,
      brand: candidate.brand,
      imageUrl: candidate.imageUrl,
      rating: Number(candidate.rating),
      reviewsCount: candidate.reviewsCount,
      referencePriceUsd:
        candidate.referencePriceUsd === null ? null : Number(candidate.referencePriceUsd),
      category: { slug: candidate.category.slug, name: candidate.category.name },
      draft: candidate.agentDraft,
      rejectionReason: candidate.rejectionReason,
      rubric: candidate.category.criteria.map((c) => ({ key: c.key, label: c.label })),
    }
  }

  async approve(id: string, sheet: SheetInput, adminId: string) {
    return db.transaction(async (trx) => {
      const product = await this.#lockPending(trx, id)

      const criteria = await RubricCriterion.query({ client: trx }).where(
        'category_id',
        product.categoryId
      )
      await this.#validateAgainstRubric(trx, sheet, criteria, product.id)

      product.useTransaction(trx)
      product.merge({
        summary: sheet.summary,
        idealFor: sheet.idealFor,
        notFor: sheet.notFor,
        pros: sheet.pros,
        cons: sheet.cons,
        keySpecs: sheet.keySpecs ?? product.keySpecs,
        badges: sheet.badges ?? [],
        affiliateUrl: this.links.build(product.asin),
        status: 'approved',
        reviewedById: adminId,
        reviewedAt: (await import('luxon')).DateTime.now(),
      })
      await product.save()

      await trx.from('product_scores').where('product_id', product.id).delete()
      await trx.table('product_scores').multiInsert(
        criteria.map((c) => ({
          product_id: product.id,
          criterion_id: c.id,
          score: sheet.scores[c.key],
        }))
      )

      await trx.from('product_pairings').where('product_id', product.id).delete()
      if (sheet.pairedProductIds?.length) {
        await trx.table('product_pairings').multiInsert(
          sheet.pairedProductIds.map((pairedId) => ({
            product_id: product.id,
            paired_product_id: pairedId,
          }))
        )
      }

      await this.#recalculatePriceTiers(trx, product.categoryId)

      return {
        id: product.id,
        status: product.status,
        slug: product.slug,
        affiliateUrl: product.affiliateUrl,
        reviewedAt: product.reviewedAt?.toISO() ?? null,
      }
    })
  }

  async reject(id: string, reason: string | undefined, adminId: string) {
    return db.transaction(async (trx) => {
      const product = await this.#lockPending(trx, id)
      product.useTransaction(trx)
      product.merge({
        status: 'rejected',
        rejectionReason: reason ?? null,
        reviewedById: adminId,
        reviewedAt: (await import('luxon')).DateTime.now(),
      })
      await product.save()
      return {
        id: product.id,
        status: product.status,
        slug: product.slug,
        affiliateUrl: null,
        reviewedAt: product.reviewedAt?.toISO() ?? null,
      }
    })
  }

  async #lockPending(trx: TransactionClientContract, id: string) {
    const product = await Product.query({ client: trx }).where('id', id).forUpdate().first()
    if (!product) throw new CandidateNotFoundError()
    if (product.status !== 'pending') throw new CandidateAlreadyReviewedError()
    return product
  }

  async #validateAgainstRubric(
    trx: TransactionClientContract,
    sheet: SheetInput,
    criteria: RubricCriterion[],
    productId: string
  ) {
    const errors: Array<{ field: string; message: string }> = []
    const expected = new Set(criteria.map((c) => c.key))

    for (const criterion of criteria) {
      if (sheet.scores[criterion.key] === undefined) {
        errors.push({
          field: `sheet.scores.${criterion.key}`,
          message: `Falta la nota de "${criterion.label}" (${criterion.key})`,
        })
      }
    }
    for (const key of Object.keys(sheet.scores)) {
      if (!expected.has(key)) {
        errors.push({
          field: `sheet.scores.${key}`,
          message: `"${key}" no es un criterio de la rúbrica de esta categoría`,
        })
      }
    }

    const paired = sheet.pairedProductIds ?? []
    if (paired.includes(productId)) {
      errors.push({
        field: 'sheet.pairedProductIds',
        message: 'Un producto no combina consigo mismo',
      })
    }
    if (paired.length) {
      const approved = await trx
        .from('products')
        .whereIn('id', paired)
        .where('status', 'approved')
        .select('id')
      if (approved.length !== paired.length) {
        errors.push({
          field: 'sheet.pairedProductIds',
          message: 'Solo se puede combinar con productos publicados',
        })
      }
    }

    if (errors.length) throw new SheetRubricError(errors)
  }

  async #recalculatePriceTiers(trx: TransactionClientContract, categoryId: string) {
    const rows = await trx
      .from('products')
      .where({ category_id: categoryId, status: 'approved' })
      .select('id', 'reference_price_usd')
    const tiers = assignPriceTiers(
      rows.map((r) => ({
        id: r.id,
        priceUsd: r.reference_price_usd === null ? null : Number(r.reference_price_usd),
      }))
    )
    for (const [id, tier] of Object.entries(tiers)) {
      await trx.from('products').where('id', id).update({ price_tier: tier })
    }
  }
}
