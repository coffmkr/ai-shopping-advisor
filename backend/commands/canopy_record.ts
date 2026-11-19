import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import { join } from 'node:path'
import env from '#start/env'
import CanopyMcpClient from '#adapters/canopy/canopy_mcp_client'
import { CATEGORY_FIXTURES } from '#database/fixtures/categories'

/**
 * Graba respuestas reales de Canopy como fixtures (database/fixtures/canopy/).
 * Se ejecuta una sola vez: no vuelve a llamar si la fixture ya existe, salvo con --force.
 *
 *   node ace canopy:record --searches          → una búsqueda por categoría (4 peticiones)
 *   node ace canopy:record --products=A,B,C    → detalle de cada ASIN (1 petición por ASIN)
 */
export default class CanopyRecord extends BaseCommand {
  static commandName = 'canopy:record'
  static description = 'Graba respuestas de Canopy como fixtures para la semilla y los tests'
  static options: CommandOptions = { startApp: true }

  @flags.boolean({ description: 'Graba una búsqueda por categoría' })
  declare searches: boolean

  @flags.array({ description: 'ASIN cuyo detalle se graba' })
  declare products: string[]

  @flags.boolean({ description: 'Vuelve a llamar aunque la fixture exista' })
  declare force: boolean

  #dir = join(this.app.makePath('database/fixtures/canopy'))
  #requests = 0

  async run() {
    const client = new CanopyMcpClient(
      env.get('CANOPY_MCP_URL'),
      env.get('CANOPY_API_KEY')?.release() ?? ''
    )
    await mkdir(this.#dir, { recursive: true })

    try {
      if (this.searches) {
        for (const category of CATEGORY_FIXTURES) {
          await this.#record(`search-${category.slug}.json`, () =>
            client.callTool('search_amazon_products', {
              searchTerm: category.searchTerm,
              domain: 'US',
            })
          )
        }
      }
      for (const asin of (this.products ?? []).flatMap((value) => value.split(','))) {
        await this.#record(`product-${asin.trim()}.json`, () =>
          client.callTool('get_amazon_product', { asin: asin.trim(), domain: 'US' })
        )
      }
    } finally {
      await client.close()
    }
    this.logger.info(`Peticiones a Canopy en esta ejecución: ${this.#requests}`)
  }

  async #record(file: string, call: () => Promise<unknown>) {
    const path = join(this.#dir, file)
    if (!this.force && (await this.#exists(path))) {
      this.logger.info(`Ya existe ${file}, no se llama a Canopy`)
      return JSON.parse(await readFile(path, 'utf8'))
    }
    this.#requests++
    const data = await call()
    await writeFile(path, JSON.stringify(data, null, 2) + '\n')
    this.logger.success(`Grabado ${file}`)
    return data
  }

  async #exists(path: string) {
    try {
      await access(path)
      return true
    } catch {
      return false
    }
  }
}
