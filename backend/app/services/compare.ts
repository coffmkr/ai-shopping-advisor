export interface ComparableProduct {
  id: string
  rating: number
  reviewsCount: number
  scores: Record<string, number>
}

/**
 * Producto con la mejor nota en cada criterio. Desempate total y determinista:
 * nota → valoración en Amazon → número de reseñas → id. Así el resultado no
 * depende del orden en que el visitante eligió los productos.
 */
export function bestByCriterion(
  criteria: string[],
  products: ComparableProduct[]
): Record<string, string> {
  const best: Record<string, string> = {}
  for (const criterion of criteria) {
    const winner = [...products].sort(
      (a, b) =>
        (b.scores[criterion] ?? -1) - (a.scores[criterion] ?? -1) ||
        b.rating - a.rating ||
        b.reviewsCount - a.reviewsCount ||
        a.id.localeCompare(b.id)
    )[0]
    if (winner) best[criterion] = winner.id
  }
  return best
}
