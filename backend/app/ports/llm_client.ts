import type { ProviderProductDetail } from '#ports/catalog_provider'

export interface DraftRequest {
  product: ProviderProductDetail
  category: { name: string }
  rubric: Array<{ key: string; label: string }>
}

/**
 * Puerto: redacta el borrador de la ficha de recomendación de un producto.
 * Devuelve datos sin validar: el servicio del agente los valida siempre
 * (la salida de un LLM nunca se da por buena).
 */
export abstract class LlmClient {
  abstract draftSheet(request: DraftRequest): Promise<unknown>
}

export class LlmClientError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LlmClientError'
  }
}
