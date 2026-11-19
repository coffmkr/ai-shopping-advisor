import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Product from '#models/product'
import ClickEvent from '#models/click_event'
import { redirectValidator } from '#validators/redirect'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default class RedirectController {
  /**
   * GET /go/:id?src=listing|detail|compare
   * Registra el clic (sin IP ni datos personales) y redirige con 302 al link de
   * afiliado construido al aprobar el producto.
   */
  async show({ params, request, response }: HttpContext) {
    const { src } = await request.validateUsing(redirectValidator, {
      data: request.qs(),
    })

    if (!UUID.test(params.id)) return response.notFound()
    const product = await Product.query()
      .where('id', params.id)
      .where('status', 'approved')
      .whereNotNull('affiliate_url')
      .first()
    if (!product) return response.notFound()

    await ClickEvent.create({ productId: product.id, source: src, occurredAt: DateTime.now() })
    // Cabecera explícita: el link de afiliado se usa tal cual, sin heredar la
    // query string de esta petición (?src=...).
    response.header('Location', product.affiliateUrl!)
    return response.status(302).send('')
  }
}
