import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import ReviewService, {
  CandidateAlreadyReviewedError,
  CandidateNotFoundError,
  SheetRubricError,
} from '#services/review_service'
import { reviewValidator } from '#validators/review'
import { PRODUCT_STATUSES } from '#models/types'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const listValidator = vine.create({
  status: vine.enum(PRODUCT_STATUSES).optional(),
  agentRunId: vine.string().uuid().optional(),
})

@inject()
export default class CandidatesController {
  constructor(private readonly review: ReviewService) {}

  /** GET /api/admin/candidates?status=pending&agentRunId= */
  async index({ request }: HttpContext) {
    const filters = await request.validateUsing(listValidator, { data: request.qs() })
    return {
      data: await this.review.listCandidates({
        status: filters.status ?? 'pending',
        agentRunId: filters.agentRunId,
      }),
    }
  }

  /** GET /api/admin/candidates/:id */
  async show({ params, response }: HttpContext) {
    const candidate = UUID.test(params.id) ? await this.review.getCandidate(params.id) : null
    if (!candidate)
      return response.notFound({ error: 'not_found', message: 'El candidato no existe' })
    return candidate
  }

  /** PATCH /api/admin/candidates/:id  { action: 'approve', sheet } | { action: 'reject', reason? } */
  async update({ params, request, response, auth }: HttpContext) {
    if (!UUID.test(params.id)) {
      return response.notFound({ error: 'not_found', message: 'El candidato no existe' })
    }
    const payload = await request.validateUsing(reviewValidator)
    const adminId = auth.getUserOrFail().id

    try {
      return payload.action === 'approve' && payload.sheet
        ? await this.review.approve(params.id, payload.sheet, adminId)
        : await this.review.reject(params.id, payload.reason, adminId)
    } catch (error) {
      if (error instanceof CandidateNotFoundError) {
        return response.notFound({ error: 'not_found', message: 'El candidato no existe' })
      }
      if (error instanceof CandidateAlreadyReviewedError) {
        return response.conflict({
          error: 'already_reviewed',
          message: 'Este candidato ya fue revisado',
        })
      }
      if (error instanceof SheetRubricError) {
        return response.unprocessableEntity({ errors: error.errors })
      }
      throw error
    }
  }
}
