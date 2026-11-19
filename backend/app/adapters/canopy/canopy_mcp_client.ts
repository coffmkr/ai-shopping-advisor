import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { CatalogProviderError } from '#ports/catalog_provider'

/**
 * Cliente MCP mínimo para Canopy (Streamable HTTP). Devuelve el JSON crudo de
 * cada herramienta; el mapeo al dominio lo hace CanopyCatalogProvider.
 * La API key viaja solo en cabeceras y nunca se escribe en logs ni errores.
 */
export default class CanopyMcpClient {
  #client: Client | null = null

  constructor(
    private readonly url: string,
    private readonly apiKey: string
  ) {
    if (!apiKey) {
      throw new CatalogProviderError('Falta CANOPY_API_KEY', false)
    }
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const client = await this.#connect()
    let result
    try {
      result = await client.callTool({ name, arguments: args })
    } catch (error) {
      throw new CatalogProviderError(this.#safeMessage(error), true)
    }

    const text = (result.content as Array<{ type: string; text?: string }>)
      .map((part) => part.text ?? '')
      .join('')

    if (result.isError) {
      throw new CatalogProviderError(this.#safeMessage(text), /rate|timeout|5\d\d/i.test(text))
    }

    try {
      return JSON.parse(text)
    } catch {
      throw new CatalogProviderError('Respuesta de Canopy no es JSON', false)
    }
  }

  async close() {
    await this.#client?.close()
    this.#client = null
  }

  async #connect() {
    if (this.#client) return this.#client
    const transport = new StreamableHTTPClientTransport(new URL(this.url), {
      requestInit: {
        headers: { 'Authorization': `Bearer ${this.apiKey}`, 'API-KEY': this.apiKey },
      },
    })
    const client = new Client({ name: 'ai-shopping-advisor', version: '0.1.0' })
    try {
      await client.connect(transport)
    } catch (error) {
      throw new CatalogProviderError(this.#safeMessage(error), true)
    }
    this.#client = client
    return client
  }

  #safeMessage(error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return message.replaceAll(this.apiKey, '***').slice(0, 300)
  }
}
