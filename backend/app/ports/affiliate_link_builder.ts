/**
 * Puerto: construye el link de afiliado de un producto.
 *
 * Regla de negocio: el link se construye SIEMPRE en el servidor a partir del ASIN
 * validado y del tag de la tienda. Por eso la firma solo acepta un ASIN: no hay
 * forma de pasarle una URL del proveedor de datos (que trae tags ajenos).
 */
export interface AffiliateLinkBuilder {
  build(asin: string): string
}

export const ASIN_PATTERN = /^[A-Z0-9]{10}$/

export class InvalidAsinError extends Error {
  constructor(value: string) {
    super(`ASIN inválido: "${value.slice(0, 40)}"`)
    this.name = 'InvalidAsinError'
  }
}
