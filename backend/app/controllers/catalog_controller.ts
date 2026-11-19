import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import CatalogService from '#services/catalog_service'

@inject()
export default class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  async categories() {
    return this.catalog.listCategories()
  }

  async categoryProducts({ params, response }: HttpContext) {
    const result = await this.catalog.listCategoryProducts(params.slug)
    if (!result) return response.notFound({ error: 'not_found', message: 'La categoría no existe' })
    return result
  }

  async product({ params, response }: HttpContext) {
    const result = await this.catalog.getProductSheet(params.slug)
    if (!result) return response.notFound({ error: 'not_found', message: 'El producto no existe' })
    return result
  }
}
