import { LlmClient, type DraftRequest } from '#ports/llm_client'

export const BASIC_DRAFT_PREFIX = 'Borrador automático sin IA'

/**
 * Borrador determinista para cuando no hay clave de la API de Claude: usa solo
 * los datos del producto y deja notas neutras. El resumen lo deja claro para
 * que el administrador lo reescriba antes de aprobar.
 */
export default class BasicDraftLlmClient extends LlmClient {
  async draftSheet({ product, rubric }: DraftRequest) {
    const rating = product.rating === null ? 'sin valoración' : `${product.rating}★`
    const reviews =
      product.reviewsCount === null
        ? ''
        : ` con ${product.reviewsCount.toLocaleString('es-PE')} valoraciones`

    const keySpecs: Record<string, string> = {}
    for (const [name, value] of Object.entries(product.specs).slice(0, 5)) {
      keySpecs[name] = value.slice(0, 200)
    }

    return {
      asin: product.asin,
      summary:
        `${BASIC_DRAFT_PREFIX}: ${product.brand ?? 'producto'} ${rating}${reviews}. Reescribe por qué lo recomendamos.`.slice(
          0,
          500
        ),
      idealFor: 'Completar: para quién es ideal.',
      notFor: 'Completar: para quién no es.',
      pros: [`Valoración de ${rating}${reviews}`.slice(0, 120)],
      cons: ['Completar: un contra del producto.'],
      keySpecs,
      scores: Object.fromEntries(rubric.map((criterion) => [criterion.key, 5])),
    }
  }
}
