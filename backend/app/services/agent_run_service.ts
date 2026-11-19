import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import env from '#start/env'
import AgentRun from '#models/agent_run'
import Category from '#models/category'
import { JobQueue } from '#ports/job_queue'

export class CategoryNotFoundError extends Error {}
export class ActiveRunExistsError extends Error {
  constructor() {
    super('Ya hay una búsqueda en curso para esta categoría')
  }
}
export class DailyLimitError extends Error {
  constructor() {
    super('Se alcanzó el límite diario de búsquedas del agente. Inténtalo mañana.')
  }
}

function serialize(run: AgentRun) {
  return {
    id: run.id,
    categoryId: run.categoryId,
    category: run.category ? { slug: run.category.slug, name: run.category.name } : undefined,
    maxPriceUsd: run.maxPriceUsd === null ? null : Number(run.maxPriceUsd),
    status: run.status,
    isSeed: run.isSeed,
    candidatesCreated: run.candidatesCreated,
    providerRequests: run.providerRequests,
    errorMessage: run.errorMessage,
    createdAt: run.createdAt.toISO(),
    startedAt: run.startedAt?.toISO() ?? null,
    finishedAt: run.finishedAt?.toISO() ?? null,
  }
}

/** Búsquedas del agente: lanzar (encolar), listar y consultar su estado. */
@inject()
export default class AgentRunService {
  constructor(private readonly queue: JobQueue) {}

  async launch(input: { categoryId: string; maxPriceUsd?: number }, adminId: string) {
    const category = await Category.find(input.categoryId)
    if (!category) throw new CategoryNotFoundError()

    const startOfDay = DateTime.now().startOf('day').toJSDate()
    const [row] = await AgentRun.query()
      .where('is_seed', false)
      .where('created_at', '>=', startOfDay)
      .count('* as total')
    if (Number(row.$extras.total) >= env.get('CANOPY_MAX_SEARCHES_PER_DAY'))
      throw new DailyLimitError()

    const active = await AgentRun.query()
      .where('category_id', category.id)
      .whereIn('status', ['queued', 'running'])
      .first()
    if (active) throw new ActiveRunExistsError()

    let run: AgentRun
    try {
      run = await AgentRun.create({
        categoryId: category.id,
        requestedById: adminId,
        maxPriceUsd: input.maxPriceUsd === undefined ? null : String(input.maxPriceUsd),
        status: 'queued',
        isSeed: false,
        providerRequests: 0,
        candidatesCreated: 0,
      })
    } catch (error: any) {
      // Índice único parcial: otra petición simultánea ganó la carrera
      if (error?.code === '23505') throw new ActiveRunExistsError()
      throw error
    }

    try {
      await this.queue.enqueueAgentRun(run.id)
    } catch {
      run.merge({
        status: 'failed',
        errorMessage: 'No se pudo encolar la búsqueda. Vuelve a intentarlo.',
        finishedAt: DateTime.now(),
      })
      await run.save()
    }

    await run.load('category')
    return serialize(run)
  }

  async list() {
    const runs = await AgentRun.query()
      .preload('category')
      .orderBy('created_at', 'desc')
      .orderBy('id', 'desc')
      .limit(50)
    return runs.map(serialize)
  }

  async get(id: string) {
    const run = await AgentRun.query().where('id', id).preload('category').first()
    return run ? serialize(run) : null
  }
}
