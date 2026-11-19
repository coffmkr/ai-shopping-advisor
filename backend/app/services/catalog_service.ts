import Category from '#models/category'
import Product from '#models/product'
import type { ClickSource, PriceTier } from '#models/types'
import { bestByCriterion } from '#services/compare'

export class DifferentCategoriesError extends Error {
  constructor() {
    super('Solo se comparan productos de la misma categoría')
    this.name = 'DifferentCategoriesError'
  }
}

/**
 * Consultas públicas del catálogo. Cada respuesta se construye campo a campo:
 * nunca se serializa un modelo completo, así una columna interna nueva no se
 * expone por accidente (link de afiliado, precio exacto, datos del proveedor,
 * borrador del agente).
 */

export interface PublicCriterion {
  key: string
  label: string
}

export interface ProductCard {
  id: string
  slug: string
  title: string
  imageUrl: string | null
  categorySlug: string
  priceTier: PriceTier | null
  summary: string
  scores: Record<string, number>
  averageScore: number
  badges: string[]
  goUrl: string
}

const TIER_ORDER: PriceTier[] = ['budget', 'mid', 'premium']

export function goUrl(productId: string, source: ClickSource) {
  return `/go/${productId}?src=${source}`
}

function scoresOf(product: Product) {
  const scores: Record<string, number> = {}
  for (const criterion of product.scores) {
    scores[criterion.key] = Number(criterion.$extras.pivot_score)
  }
  return scores
}

function average(scores: Record<string, number>) {
  const values = Object.values(scores)
  if (values.length === 0) return 0
  return Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) / 10
}

function toCard(product: Product, categorySlug: string, source: ClickSource): ProductCard {
  const scores = scoresOf(product)
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    imageUrl: product.imageUrl,
    categorySlug,
    priceTier: product.priceTier,
    summary: product.summary ?? '',
    scores,
    averageScore: average(scores),
    badges: product.badges,
    goUrl: goUrl(product.id, source),
  }
}

function approvedWithScores() {
  return Product.query()
    .where('status', 'approved')
    .preload('scores', (q) => q.pivotColumns(['score']))
    .preload('category')
}

function byAverageDesc(a: ProductCard, b: ProductCard) {
  return b.averageScore - a.averageScore || a.title.localeCompare(b.title)
}

export default class CatalogService {
  async listCategories() {
    const categories = await Category.query()
      .withCount('products', (q) => q.where('status', 'approved'))
      .orderBy('name')

    const products = await approvedWithScores()
    const bestByCategory = new Map<string, ProductCard>()
    for (const product of products) {
      const card = toCard(product, product.category.slug, 'listing')
      const current = bestByCategory.get(card.categorySlug)
      if (!current || byAverageDesc(card, current) < 0) bestByCategory.set(card.categorySlug, card)
    }

    return {
      categories: categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        icon: category.icon,
        productCount: Number(category.$extras.products_count),
      })),
      featured: categories
        .map((category) => bestByCategory.get(category.slug))
        .filter((card): card is ProductCard => card !== undefined),
    }
  }

  async listCategoryProducts(slug: string) {
    const category = await Category.query()
      .where('slug', slug)
      .preload('criteria', (q) => q.orderBy('position'))
      .first()
    if (!category) return null

    const products = await approvedWithScores().where('category_id', category.id)

    return {
      category: { slug: category.slug, name: category.name },
      criteria: category.criteria.map((c) => ({ key: c.key, label: c.label })),
      products: products.map((p) => toCard(p, category.slug, 'listing')).sort(byAverageDesc),
    }
  }

  async getProductSheet(slug: string) {
    const product = await approvedWithScores()
      .where('slug', slug)
      .preload('category', (q) => q.preload('criteria', (c) => c.orderBy('position')))
      .preload('pairings', (q) =>
        q
          .where('status', 'approved')
          .preload('scores', (s) => s.pivotColumns(['score']))
          .preload('category')
      )
      .first()
    if (!product) return null

    const category = product.category
    const siblings = await approvedWithScores()
      .where('category_id', category.id)
      .whereNot('id', product.id)
    const alternatives = this.#alternatives(product, siblings).map((p) =>
      toCard(p, category.slug, 'detail')
    )

    return {
      product: {
        id: product.id,
        slug: product.slug,
        title: product.title,
        brand: product.brand,
        imageUrl: product.imageUrl,
        category: { slug: category.slug, name: category.name },
        criteria: category.criteria.map((c) => ({ key: c.key, label: c.label })),
        summary: product.summary,
        idealFor: product.idealFor,
        notFor: product.notFor,
        pros: product.pros,
        cons: product.cons,
        scores: scoresOf(product),
        keySpecs: product.keySpecs,
        badges: product.badges,
        priceTier: product.priceTier,
        rating: Number(product.rating),
        reviewsCount: product.reviewsCount,
        reviewedAt: product.reviewedAt?.toISO() ?? null,
        goUrl: goUrl(product.id, 'detail'),
      },
      alternatives,
      pairings: product.pairings.map((p) => toCard(p, p.category.slug, 'detail')),
    }
  }

  /**
   * Compara productos aprobados de una misma categoría. Devuelve null si alguno
   * no existe o no está aprobado; lanza DifferentCategoriesError si mezclan categorías.
   */
  async compareProducts(ids: string[]) {
    const products = await approvedWithScores()
      .whereIn('id', ids)
      .preload('category', (q) => q.preload('criteria', (c) => c.orderBy('position')))
    if (products.length !== ids.length) return null

    const categoryIds = new Set(products.map((p) => p.categoryId))
    if (categoryIds.size > 1) throw new DifferentCategoriesError()

    const category = products[0].category
    const criteria = category.criteria.map((c) => ({ key: c.key, label: c.label }))
    const ordered = ids.map((id) => products.find((p) => p.id === id)!)

    return {
      category: { slug: category.slug, name: category.name },
      criteria,
      products: ordered.map((product) => ({
        id: product.id,
        slug: product.slug,
        title: product.title,
        imageUrl: product.imageUrl,
        priceTier: product.priceTier,
        scores: scoresOf(product),
        idealFor: product.idealFor,
        pros: product.pros,
        cons: product.cons,
        keySpecs: product.keySpecs,
        badges: product.badges,
        goUrl: goUrl(product.id, 'compare'),
      })),
      bestByCriterion: bestByCriterion(
        criteria.map((c) => c.key),
        ordered.map((p) => ({
          id: p.id,
          rating: Number(p.rating),
          reviewsCount: p.reviewsCount,
          scores: scoresOf(p),
        }))
      ),
    }
  }

  /** Una alternativa más barata y una más premium (las mejor valoradas de cada lado). */
  #alternatives(product: Product, siblings: Product[]) {
    const tierIndex = TIER_ORDER.indexOf(product.priceTier ?? 'mid')
    const best = (candidates: Product[]) =>
      candidates.sort((a, b) => average(scoresOf(b)) - average(scoresOf(a)))[0]

    const cheaper = best(
      siblings.filter((p) => p.priceTier && TIER_ORDER.indexOf(p.priceTier) < tierIndex)
    )
    const pricier = best(
      siblings.filter((p) => p.priceTier && TIER_ORDER.indexOf(p.priceTier) > tierIndex)
    )
    return [cheaper, pricier].filter((p): p is Product => p !== undefined)
  }
}
