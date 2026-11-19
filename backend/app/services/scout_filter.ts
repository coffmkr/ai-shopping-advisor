import { ASIN_PATTERN } from '#ports/affiliate_link_builder'
import type { ProviderSearchResult } from '#ports/catalog_provider'

export const MAX_CANDIDATES = 4

type Complete = ProviderSearchResult & { priceUsd: number; rating: number; reviewsCount: number }

/**
 * Filtros deterministas del agente (en código, no en el LLM):
 * patrocinados, ASIN inválido, sin precio o valoración, por encima del precio
 * máximo, variantes repetidas (misma valoración y mismas reseñas) y productos
 * que ya existen en el sistema en cualquier estado. Devuelve los mejores por
 * valoración ponderada por número de reseñas.
 */
export function filterSearchResults(
  results: ProviderSearchResult[],
  options: { maxPriceUsd?: number | null; existingAsins: Set<string> }
): Complete[] {
  const seenVariants = new Set<string>()

  return results
    .filter(
      (r): r is Complete => r.priceUsd !== null && r.rating !== null && r.reviewsCount !== null
    )
    .filter((r) => !r.isSponsored)
    .filter((r) => ASIN_PATTERN.test(r.asin))
    .filter((r) => !options.maxPriceUsd || r.priceUsd <= options.maxPriceUsd)
    .filter((r) => !options.existingAsins.has(r.asin))
    .filter((r) => {
      const variant = `${r.rating}-${r.reviewsCount}`
      if (seenVariants.has(variant)) return false
      seenVariants.add(variant)
      return true
    })
    .sort((a, b) => weight(b) - weight(a))
    .slice(0, MAX_CANDIDATES)
}

function weight(r: Complete) {
  return r.rating * Math.log10(Math.max(r.reviewsCount, 1))
}
