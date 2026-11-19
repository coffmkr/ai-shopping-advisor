import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { JobQueue } from '#ports/job_queue'
import ScoutService from '#services/scout_service'
import PgBossJobQueue, { AGENT_RUN_QUEUE } from '#adapters/pgboss/pgboss_job_queue'

/**
 * Worker del agente buscador: procesa la cola "agent-run" de pg-boss de una en
 * una búsqueda. Se levanta con `make start` junto al servidor y la web.
 */
export default class AgentWork extends BaseCommand {
  static commandName = 'agent:work'
  static description = 'Procesa las búsquedas del agente encoladas en pg-boss'
  static options: CommandOptions = { startApp: true, staysAlive: true }

  async run() {
    const queue = await this.app.container.make(JobQueue)
    if (!(queue instanceof PgBossJobQueue)) {
      this.logger.error('La cola configurada no es pg-boss; no hay nada que procesar')
      return
    }

    const boss = await queue.boss()
    await boss.work<{ agentRunId: string }>(AGENT_RUN_QUEUE, { batchSize: 1 }, async (jobs) => {
      for (const job of jobs) {
        this.logger.info(`Ejecutando búsqueda ${job.data.agentRunId}`)
        const scout = await this.app.container.make(ScoutService)
        await scout.run(job.data.agentRunId)
        this.logger.info(`Búsqueda ${job.data.agentRunId} terminada`)
      }
    })
    this.logger.success('Worker del agente escuchando la cola "agent-run"')

    this.app.terminating(async () => {
      await queue.stop()
    })
  }
}
