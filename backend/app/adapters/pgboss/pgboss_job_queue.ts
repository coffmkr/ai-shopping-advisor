import { PgBoss } from 'pg-boss'
import { JobQueue } from '#ports/job_queue'

export const AGENT_RUN_QUEUE = 'agent-run'

/**
 * Cola sobre pg-boss, en el mismo PostgreSQL (esquema propio "pgboss").
 * Se conecta de forma perezosa en el primer uso.
 */
export default class PgBossJobQueue extends JobQueue {
  #boss: PgBoss | null = null
  #starting: Promise<PgBoss> | null = null

  constructor(private readonly connectionString: string) {
    super()
  }

  async boss(): Promise<PgBoss> {
    if (this.#boss) return this.#boss
    this.#starting ??= (async () => {
      const boss = new PgBoss({ connectionString: this.connectionString, schema: 'pgboss' })
      boss.on('error', (error) => console.error('[pg-boss]', error.message))
      await boss.start()
      await boss.createQueue(AGENT_RUN_QUEUE)
      this.#boss = boss
      return boss
    })()
    return this.#starting
  }

  async enqueueAgentRun(agentRunId: string) {
    const boss = await this.boss()
    await boss.send(AGENT_RUN_QUEUE, { agentRunId })
  }

  async stop() {
    await this.#boss?.stop({ graceful: true })
    this.#boss = null
    this.#starting = null
  }
}
