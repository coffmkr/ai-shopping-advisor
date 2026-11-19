import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import CatalogService, { DifferentCategoriesError } from '#services/catalog_service'
import { compareValidator, parseIds } from '#validators/compare'

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

  async compare({ request, response }: HttpContext) {
    const { ids } = await request.validateUsing(compareValidator, {
      data: { ids: parseIds(request.qs().ids) },
    })

    try {
      const result = await this.catalog.compareProducts(ids)
      if (!result) {
        return response.notFound({
          error: 'not_found',
          message: 'Algún producto no existe o ya no está publicado',
        })
      }
      return result
    } catch (error) {
      if (error instanceof DifferentCategoriesError) {
        return response.unprocessableEntity({ error: 'validation_error', message: error.message })
      }
      throw error
    }
  }

  async product({ params, response }: HttpContext) {
    const result = await this.catalog.getProductSheet(params.slug)
    if (!result) return response.notFound({ error: 'not_found', message: 'El producto no existe' })
    return result
  }
}
