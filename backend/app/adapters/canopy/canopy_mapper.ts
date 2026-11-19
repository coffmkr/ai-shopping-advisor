import type { ProviderProductDetail, ProviderSearchResult } from '#ports/catalog_provider'

/**
 * Traduce las respuestas de Canopy (servidor MCP 3.0) a los tipos del dominio.
 * Descarta a propósito el campo `url` del proveedor: trae un tag de afiliado ajeno.
 */

interface CanopyItem {
  asin?: string
  title?: string
  brand?: string | null
  mainImageUrl?: string | null
  price?: { value?: number | null } | null
  rating?: number | null
  ratingsTotal?: number | null
  sponsored?: boolean
  isPrime?: boolean
  featureBullets?: string[] | null
  technicalSpecifications?: Array<{ name?: string; value?: string }> | null
}

function mapItem(item: CanopyItem): ProviderSearchResult | null {
  if (!item.asin || !item.title) return null
  return {
    asin: item.asin,
    title: item.title,
    brand: item.brand ?? null,
    imageUrl: item.mainImageUrl ?? null,
    priceUsd: item.price?.value ?? null,
    rating: item.rating ?? null,
    reviewsCount: item.ratingsTotal ?? null,
    isSponsored: Boolean(item.sponsored),
    isPrime: Boolean(item.isPrime),
  }
}

export function mapSearchResults(response: any): ProviderSearchResult[] {
  const items: CanopyItem[] =
    response?.data?.amazonProductSearchResults?.productResults?.results ?? []
  return items.map(mapItem).filter((item): item is ProviderSearchResult => item !== null)
}

export function mapProductDetail(response: any): ProviderProductDetail | null {
  const product: CanopyItem | null | undefined = response?.data?.amazonProduct
  if (!product) return null
  const base = mapItem(product)
  if (!base) return null

  const specs: Record<string, string> = {}
  for (const spec of product.technicalSpecifications ?? []) {
    if (spec.name && spec.value && !(spec.name in specs)) specs[spec.name] = spec.value
  }
  return { ...base, featureBullets: product.featureBullets ?? [], specs }
}
