import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const RANGE_MESSAGE = 'Se comparan de 2 a 4 productos'

export const compareValidator = vine.create({
  ids: vine.array(vine.string().uuid()).minLength(2).maxLength(4).distinct(),
})

compareValidator.messagesProvider = new SimpleMessagesProvider({
  'ids.array.minLength': RANGE_MESSAGE,
  'ids.array.maxLength': RANGE_MESSAGE,
  'ids.array.distinct': 'No se puede comparar el mismo producto dos veces',
  'ids.*.uuid': 'Identificador de producto inválido',
})

/**
 * `?ids=a,b,c` → `['a', 'b', 'c']`. El parser de query string de AdonisJS ya
 * puede entregar una lista (separa por comas); se aceptan ambas formas.
 */
export function parseIds(raw: unknown): string[] {
  const parts = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(',') : []
  return parts.map((id) => String(id).trim()).filter(Boolean)
}
