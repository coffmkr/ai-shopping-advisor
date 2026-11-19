/**
 * Contrato de la API pública del catálogo (ver README, sección 4).
 */

export type PriceTier = 'budget' | 'mid' | 'premium'

export interface Criterion {
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

export interface CategorySummary {
  slug: string
  name: string
  icon: string | null
  productCount: number
}

export interface CategoriesResponse {
  categories: CategorySummary[]
  featured: ProductCard[]
}

export interface CategoryProductsResponse {
  category: { slug: string; name: string }
  criteria: Criterion[]
  products: ProductCard[]
}

export interface ProductSheet {
  id: string
  slug: string
  title: string
  brand: string | null
  imageUrl: string | null
  category: { slug: string; name: string }
  criteria: Criterion[]
  summary: string
  idealFor: string
  notFor: string
  pros: string[]
  cons: string[]
  scores: Record<string, number>
  keySpecs: Record<string, string>
  badges: string[]
  priceTier: PriceTier | null
  rating: number
  reviewsCount: number
  reviewedAt: string | null
  goUrl: string
}

export interface ProductSheetResponse {
  product: ProductSheet
  alternatives: ProductCard[]
  pairings: ProductCard[]
}

export interface ComparedProduct {
  id: string
  slug: string
  title: string
  imageUrl: string | null
  priceTier: PriceTier | null
  scores: Record<string, number>
  idealFor: string
  pros: string[]
  cons: string[]
  keySpecs: Record<string, string>
  badges: string[]
  goUrl: string
}

export interface CompareResponse {
  category: { slug: string; name: string }
  criteria: Criterion[]
  products: ComparedProduct[]
  bestByCriterion: Record<string, string>
}

export const BADGE_LABELS: Record<string, string> = {
  best_rated: 'Mejor valorado',
  best_value: 'Mejor calidad-precio',
  premium_pick: 'Opción premium',
  editor_choice: 'Elección del asesor',
}

export const PRICE_TIER_LABELS: Record<PriceTier, { symbol: string; label: string }> = {
  budget: { symbol: '$', label: 'Económico' },
  mid: { symbol: '$$', label: 'Precio medio' },
  premium: { symbol: '$$$', label: 'Premium' },
}
