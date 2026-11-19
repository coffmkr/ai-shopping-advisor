import type { PriceTier } from '#models/types'

/**
 * Rango de precio relativo a la categoría ($, $$, $$$): se reparten los
 * productos con precio en terciles, del más barato al más caro. El visitante
 * nunca ve el precio exacto, solo el rango.
 */
export function assignPriceTiers(
  items: Array<{ id: string; priceUsd: number | null }>
): Record<string, PriceTier> {
  const priced = items
    .filter((item): item is { id: string; priceUsd: number } => item.priceUsd !== null)
    .sort((a, b) => a.priceUsd - b.priceUsd)

  const total = priced.length
  const tiers: Record<string, PriceTier> = {}
  if (total === 1) {
    tiers[priced[0].id] = 'mid'
    return tiers
  }

  priced.forEach((item, index) => {
    const position = index / total
    tiers[item.id] = position < 1 / 3 ? 'budget' : position < 2 / 3 ? 'mid' : 'premium'
  })
  return tiers
}
