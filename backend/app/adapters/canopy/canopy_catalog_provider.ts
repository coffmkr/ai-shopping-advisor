import type {
  CatalogProvider,
  ProviderProductDetail,
  ProviderSearchResult,
  SearchOptions,
} from '#ports/catalog_provider'
import CanopyMcpClient from '#adapters/canopy/canopy_mcp_client'
import { mapProductDetail, mapSearchResults } from '#adapters/canopy/canopy_mapper'

/**
 * Adaptador del puerto CatalogProvider sobre el servidor MCP de Canopy (amazon.com).
 */
export default class CanopyCatalogProvider implements CatalogProvider {
  constructor(private readonly client: CanopyMcpClient) {}

  async searchProducts(term: string, options: SearchOptions = {}): Promise<ProviderSearchResult[]> {
    const response = await this.client.callTool('search_amazon_products', {
      searchTerm: term,
      domain: 'US',
      ...(options.maxPriceUsd ? { maxPrice: options.maxPriceUsd } : {}),
      ...(options.limit ? { limit: options.limit } : {}),
    })
    return mapSearchResults(response)
  }

  async getProduct(asin: string): Promise<ProviderProductDetail | null> {
    const response = await this.client.callTool('get_amazon_product', { asin, domain: 'US' })
    return mapProductDetail(response)
  }

  async close() {
    await this.client.close()
  }
}
