/**
 * Puerto: fuente de datos de productos (hoy Canopy sobre amazon.com).
 *
 * Los tipos son del dominio, no del proveedor: cambiar de proveedor significa
 * escribir otro adaptador, sin tocar servicios. Ningún tipo incluye la URL del
 * producto del proveedor, porque trae tags de afiliado ajenos.
 */

export interface ProviderSearchResult {
  asin: string
  title: string
  brand: string | null
  imageUrl: string | null
  priceUsd: number | null
  rating: number | null
  reviewsCount: number | null
  isSponsored: boolean
  isPrime: boolean
}

export interface ProviderProductDetail extends ProviderSearchResult {
  featureBullets: string[]
  specs: Record<string, string>
}

export interface SearchOptions {
  maxPriceUsd?: number
  limit?: number
}

export interface CatalogProvider {
  searchProducts(term: string, options?: SearchOptions): Promise<ProviderSearchResult[]>
  getProduct(asin: string): Promise<ProviderProductDetail | null>
}

export class CatalogProviderError extends Error {
  constructor(
    message: string,
    readonly transient: boolean
  ) {
    super(message)
    this.name = 'CatalogProviderError'
  }
}
