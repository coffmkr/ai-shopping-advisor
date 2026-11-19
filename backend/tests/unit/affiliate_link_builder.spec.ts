import { test } from '@japa/runner'
import AmazonAffiliateLinkBuilder from '#adapters/amazon/amazon_affiliate_link_builder'
import { InvalidAsinError } from '#ports/affiliate_link_builder'

test.group('AmazonAffiliateLinkBuilder', () => {
  const builder = new AmazonAffiliateLinkBuilder('zapyens-20')

  test('construye el link exacto desde el ASIN y el tag de la tienda', ({ assert }) => {
    assert.equal(builder.build('B08BRCT4JH'), 'https://www.amazon.com/dp/B08BRCT4JH?tag=zapyens-20')
  })

  test('rechaza un ASIN de 9 caracteres', ({ assert }) => {
    assert.throws(() => builder.build('B08BRCT4J'), InvalidAsinError as any)
  })

  test('rechaza un ASIN con minúsculas', ({ assert }) => {
    assert.throws(() => builder.build('b08brct4jh'), InvalidAsinError as any)
  })

  test('rechaza una URL completa en lugar de un ASIN', ({ assert }) => {
    assert.throws(
      () => builder.build('https://www.amazon.com/dp/B08BRCT4JH?tag=otro-20'),
      InvalidAsinError as any
    )
  })

  test('no acepta un tag de afiliado vacío', ({ assert }) => {
    assert.throws(() => new AmazonAffiliateLinkBuilder(''))
  })
})
