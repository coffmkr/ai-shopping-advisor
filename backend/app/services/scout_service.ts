import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import string from '@adonisjs/core/helpers/string'
import AgentRun from '#models/agent_run'
import { CatalogProvider, CatalogProviderError } from '#ports/catalog_provider'
import type { ProviderProductDetail } from '#ports/catalog_provider'
import { LlmClient } from '#ports/llm_client'
import { filterSearchResults } from '#services/scout_filter'
import { agentDraftValidator, type AgentDraft } from '#validators/agent_draft'

/**
 * Agente buscador: busca en el proveedor, filtra en código, pide el borrador de
 * cada candidato al LLM, lo valida y guarda los candidatos en una transacción
 * al final (un fallo nunca deja candidatos a medias).
 */
@inject()
export default class ScoutService {
  constructor(
    private readonly provider: CatalogProvider,
    private readonly llm: LlmClient
  ) {}

  async run(agentRunId: string) {
    const run = await AgentRun.query()
      .where('id', agentRunId)
      .preload('category', (q) => q.preload('criteria', (c) => c.orderBy('position')))
      .first()
    if (!run || run.status !== 'queued') return

    run.merge({ status: 'running', startedAt: DateTime.now() })
    await run.save()

    let requests = 0
    try {
      const category = run.category
      const rubric = category.criteria.map((c) => ({ key: c.key, label: c.label }))
      const maxPriceUsd = run.maxPriceUsd === null ? null : Number(run.maxPriceUsd)

      requests++
      const results = await this.provider.searchProducts(category.searchTerm, {
        maxPriceUsd: maxPriceUsd ?? undefined,
      })
      const existing = await db
        .from('products')
        .whereIn(
          'provider_product_id',
          results.map((r) => r.asin)
        )
        .select('provider_product_id')
      const shortlist = filterSearchResults(results, {
        maxPriceUsd,
        existingAsins: new Set(existing.map((row) => row.provider_product_id)),
      })

      const candidates: Array<{ detail: ProviderProductDetail; draft: AgentDraft }> = []
      let llmFailures = 0
      for (const result of shortlist) {
        requests++
        const detail = await this.provider.getProduct(result.asin)
        if (!detail) continue

        const draft = await this.#draft(detail, category.name, rubric)
        if (draft === 'llm_error') llmFailures++
        else if (draft) candidates.push({ detail, draft })
      }

      if (shortlist.length > 0 && llmFailures === shortlist.length) {
        throw new Error('No se pudo redactar ningún borrador con el modelo de IA')
      }

      await db.transaction(async (trx) => {
        const now = new Date()
        for (const { detail, draft } of candidates) {
          await trx.table('products').insert({
            provider: 'amazon',
            provider_product_id: detail.asin,
            slug: `${string.slug(detail.title.slice(0, 80), { lower: true, strict: true })}-${detail.asin.toLowerCase()}`.slice(
              0,
              160
            ),
            category_id: category.id,
            agent_run_id: run.id,
            title: detail.title.slice(0, 500),
            brand: detail.brand?.slice(0, 120) ?? null,
            image_url: detail.imageUrl?.slice(0, 500) ?? null,
            rating: detail.rating ?? 0,
            reviews_count: detail.reviewsCount ?? 0,
            reference_price_usd: detail.priceUsd,
            key_specs: JSON.stringify(draft.keySpecs),
            provider_snapshot: JSON.stringify(detail),
            data_updated_at: now,
            agent_draft: JSON.stringify(draft),
            status: 'pending',
            created_at: now,
          })
        }
        await trx.from('agent_runs').where('id', run.id).update({
          status: 'completed',
          provider_requests: requests,
          candidates_created: candidates.length,
          finished_at: now,
        })
      })
    } catch (error) {
      const message =
        error instanceof CatalogProviderError
          ? 'El proveedor de datos (Canopy) no respondió. Vuelve a lanzar la búsqueda más tarde.'
          : error instanceof Error
            ? error.message.slice(0, 300)
            : 'Error inesperado del agente'
      logger.error({ agentRunId, err: error }, 'Búsqueda del agente fallida')
      await db.from('agent_runs').where('id', run.id).update({
        status: 'failed',
        provider_requests: requests,
        candidates_created: 0,
        error_message: message,
        finished_at: new Date(),
      })
    }
  }

  /**
   * Pide y valida el borrador. Devuelve null si el borrador no es válido (se
   * descarta el candidato) y 'llm_error' si el modelo falló.
   */
  async #draft(
    detail: ProviderProductDetail,
    categoryName: string,
    rubric: Array<{ key: string; label: string }>
  ): Promise<AgentDraft | null | 'llm_error'> {
    let raw: unknown
    try {
      raw = await this.llm.draftSheet({ product: detail, category: { name: categoryName }, rubric })
    } catch (error) {
      logger.warn({ asin: detail.asin, err: error }, 'El LLM no pudo redactar el borrador')
      return 'llm_error'
    }

    try {
      const draft = await agentDraftValidator.validate(raw)
      const keys = Object.keys(draft.scores).sort()
      const expected = rubric.map((c) => c.key).sort()
      const sameCriteria =
        keys.length === expected.length && keys.every((key, i) => key === expected[i])
      if (draft.asin !== detail.asin || !sameCriteria) {
        logger.warn({ asin: detail.asin }, 'Borrador descartado: ASIN o criterios no coinciden')
        return null
      }
      return draft
    } catch {
      logger.warn({ asin: detail.asin }, 'Borrador descartado: no cumple el formato')
      return null
    }
  }
}
