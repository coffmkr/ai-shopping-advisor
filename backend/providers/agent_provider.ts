import type { ApplicationService } from '@adonisjs/core/types'
import { JobQueue } from '#ports/job_queue'
import { LlmClient } from '#ports/llm_client'
import { CatalogProvider } from '#ports/catalog_provider'

/**
 * Registra los adaptadores reales de los puertos del agente. Los tests los
 * sustituyen con app.container.swap(...) por adaptadores falsos.
 */
export default class AgentProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton(JobQueue, async () => {
      const { default: env } = await import('#start/env')
      const { default: PgBossJobQueue } = await import('#adapters/pgboss/pgboss_job_queue')
      const user = encodeURIComponent(env.get('DB_USER'))
      const password = encodeURIComponent(env.get('DB_PASSWORD') ?? '')
      const database = this.app.inTest ? env.get('DB_TEST_DATABASE') : env.get('DB_DATABASE')
      return new PgBossJobQueue(
        `postgres://${user}:${password}@${env.get('DB_HOST')}:${env.get('DB_PORT')}/${database}`
      )
    })

    this.app.container.bind(CatalogProvider, async () => {
      const { default: env } = await import('#start/env')
      const { default: CanopyMcpClient } = await import('#adapters/canopy/canopy_mcp_client')
      const { default: CanopyCatalogProvider } =
        await import('#adapters/canopy/canopy_catalog_provider')
      return new CanopyCatalogProvider(
        new CanopyMcpClient(env.get('CANOPY_MCP_URL'), env.get('CANOPY_API_KEY')?.release() ?? '')
      )
    })

    this.app.container.bind(LlmClient, async () => {
      const { default: env } = await import('#start/env')
      const apiKey = env.get('ANTHROPIC_API_KEY')?.release()
      if (apiKey) {
        const { default: ClaudeLlmClient } = await import('#adapters/llm/claude_llm_client')
        return new ClaudeLlmClient(apiKey, env.get('AGENT_MODEL'))
      }
      const { default: BasicDraftLlmClient } = await import('#adapters/llm/basic_draft_llm_client')
      return new BasicDraftLlmClient()
    })
  }

  async shutdown() {
    if (this.app.container.hasBinding(JobQueue)) {
      const queue = (await this.app.container.make(JobQueue)) as { stop?: () => Promise<void> }
      await queue.stop?.()
    }
  }
}
