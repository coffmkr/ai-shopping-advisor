import {
  ASIN_PATTERN,
  InvalidAsinError,
  type AffiliateLinkBuilder,
} from '#ports/affiliate_link_builder'

/**
 * Link de Amazon Afiliados (amazon.com): https://www.amazon.com/dp/{ASIN}?tag={TAG}
 */
export default class AmazonAffiliateLinkBuilder implements AffiliateLinkBuilder {
  constructor(private readonly tag: string) {
    if (!tag || !tag.trim()) {
      throw new Error('El tag de afiliado de Amazon es obligatorio')
    }
  }

  build(asin: string): string {
    if (!ASIN_PATTERN.test(asin)) {
      throw new InvalidAsinError(asin)
    }
    return `https://www.amazon.com/dp/${asin}?tag=${encodeURIComponent(this.tag)}`
  }
}
