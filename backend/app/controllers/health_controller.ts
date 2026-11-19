import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'

export default class HealthController {
  /**
   * Confirma que la API responde y que la base de datos está accesible.
   */
  async show({ response }: HttpContext) {
    try {
      await db.rawQuery('select 1')
      return { status: 'ok', database: 'ok' }
    } catch {
      return response.serviceUnavailable({ status: 'degraded', database: 'unreachable' })
    }
  }
}
