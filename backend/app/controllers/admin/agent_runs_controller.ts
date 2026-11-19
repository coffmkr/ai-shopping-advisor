import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import AgentRunService, {
  ActiveRunExistsError,
  CategoryNotFoundError,
  DailyLimitError,
} from '#services/agent_run_service'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const launchValidator = vine.create({
  categoryId: vine.string().uuid(),
  maxPriceUsd: vine.number().min(1).max(1000).optional(),
})

@inject()
export default class AgentRunsController {
  constructor(private readonly runs: AgentRunService) {}

  /** POST /api/admin/agent-runs */
  async store({ request, response, auth }: HttpContext) {
    const input = await request.validateUsing(launchValidator)
    try {
      const run = await this.runs.launch(input, auth.getUserOrFail().id)
      return response.accepted(run)
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        return response.notFound({ error: 'not_found', message: 'La categoría no existe' })
      }
      if (error instanceof ActiveRunExistsError) {
        return response.conflict({ error: 'active_run_exists', message: error.message })
      }
      if (error instanceof DailyLimitError) {
        return response.tooManyRequests({ error: 'daily_limit', message: error.message })
      }
      throw error
    }
  }

  /** GET /api/admin/agent-runs */
  async index() {
    return { data: await this.runs.list() }
  }

  /** GET /api/admin/agent-runs/:id */
  async show({ params, response }: HttpContext) {
    const run = UUID.test(params.id) ? await this.runs.get(params.id) : null
    if (!run) return response.notFound({ error: 'not_found', message: 'La búsqueda no existe' })
    return run
  }
}
