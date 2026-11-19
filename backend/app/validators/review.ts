import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { BADGES } from '#models/types'

/** Forma de la ficha de recomendación (la validación contra la rúbrica la hace el servicio). */
const sheetSchema = vine.object({
  summary: vine.string().trim().minLength(20).maxLength(500),
  idealFor: vine.string().trim().minLength(1).maxLength(300),
  notFor: vine.string().trim().minLength(1).maxLength(300),
  pros: vine.array(vine.string().trim().minLength(1).maxLength(120)).minLength(1).maxLength(5),
  cons: vine.array(vine.string().trim().minLength(1).maxLength(120)).minLength(1).maxLength(5),
  scores: vine.record(vine.number().withoutDecimals().min(0).max(10)),
  keySpecs: vine.record(vine.string().trim().maxLength(200)).optional(),
  badges: vine.array(vine.enum(BADGES)).distinct().optional(),
  pairedProductIds: vine.array(vine.string().uuid()).distinct().optional(),
})

/** `{ action: 'approve', sheet }` o `{ action: 'reject', reason? }` */
export const reviewValidator = vine.create({
  action: vine.enum(['approve', 'reject'] as const),
  sheet: sheetSchema.optional().requiredWhen('action', '=', 'approve'),
  reason: vine.string().trim().maxLength(500).optional(),
})

reviewValidator.messagesProvider = new SimpleMessagesProvider({
  'action.enum': 'La acción debe ser "approve" o "reject"',
  'sheet.requiredWhen': 'Para aprobar hay que enviar la ficha',
  'sheet.summary.minLength': 'El resumen debe tener al menos 20 caracteres',
  'sheet.summary.maxLength': 'El resumen no puede superar los 500 caracteres',
  'sheet.idealFor.minLength': 'Indica para quién es ideal',
  'sheet.notFor.minLength': 'Indica para quién no es',
  'sheet.pros.array.minLength': 'Añade al menos un pro',
  'sheet.pros.array.maxLength': 'Como máximo 5 pros',
  'sheet.cons.array.minLength': 'Añade al menos un contra',
  'sheet.cons.array.maxLength': 'Como máximo 5 contras',
  'sheet.scores.*.max': 'Las notas van de 0 a 10',
  'sheet.scores.*.min': 'Las notas van de 0 a 10',
})

export type SheetInput = Infer<typeof sheetSchema>
