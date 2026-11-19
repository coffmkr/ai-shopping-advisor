import { readFile } from 'node:fs/promises'
import { JobQueue } from '#ports/job_queue'
import { LlmClient, type DraftRequest } from '#ports/llm_client'
import {
  CatalogProvider,
  type CatalogProviderError,
  type ProviderProductDetail,
  type ProviderSearchResult,
} from '#ports/catalog_provider'
import { mapProductDetail, mapSearchResults } from '#adapters/canopy/canopy_mapper'

/** Cola que solo recuerda qué se encoló. */
export class FakeJobQueue extends JobQueue {
  enqueued: string[] = []
  async enqueueAgentRun(agentRunId: string) {
    this.enqueued.push(agentRunId)
  }
}

/** Proveedor que responde con las fixtures grabadas de Canopy (sin red). */
export class FixtureCatalogProvider extends CatalogProvider {
  calls = 0
  constructor(
    private readonly searchFixture = 'search-soportes-laptop.json',
    private readonly failWith: CatalogProviderError | null = null
  ) {
    super()
  }

  async searchProducts(): Promise<ProviderSearchResult[]> {
    this.calls++
    if (this.failWith) throw this.failWith
    return mapSearchResults(await fixture(this.searchFixture))
  }

  async getProduct(asin: string): Promise<ProviderProductDetail | null> {
    this.calls++
    try {
      return mapProductDetail(await fixture(`product-${asin}.json`))
    } catch {
      // Sin fixture de detalle: se construye desde el resultado de búsqueda
      const result = mapSearchResults(await fixture(this.searchFixture)).find(
        (r) => r.asin === asin
      )
      return result ? { ...result, featureBullets: [], specs: {} } : null
    }
  }
}

/** LLM que devuelve un borrador válido, salvo para los ASIN que se le indiquen. */
export class FakeLlmClient extends LlmClient {
  requests: DraftRequest[] = []
  constructor(private readonly overrides: Record<string, (req: DraftRequest) => unknown> = {}) {
    super()
  }

  async draftSheet(request: DraftRequest) {
    this.requests.push(request)
    const override = this.overrides[request.product.asin]
    if (override) return override(request)
    return validDraft(request)
  }
}

export function validDraft(request: DraftRequest) {
  return {
    asin: request.product.asin,
    summary: `Borrador de prueba para ${request.product.asin}, con suficiente longitud.`,
    idealFor: 'Uso de prueba.',
    notFor: 'Casos fuera de la prueba.',
    pros: ['Pro de prueba'],
    cons: ['Contra de prueba'],
    keySpecs: { Material: 'Aluminio' },
    scores: Object.fromEntries(request.rubric.map((c) => [c.key, 7])),
  }
}

async function fixture(name: string) {
  const url = new URL(`../../database/fixtures/canopy/${name}`, import.meta.url)
  return JSON.parse(await readFile(url, 'utf8'))
}
