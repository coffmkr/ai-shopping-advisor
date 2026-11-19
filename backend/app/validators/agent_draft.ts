import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

/** Forma del borrador que devuelve el LLM (se valida siempre: es salida de un modelo). */
export const agentDraftValidator = vine.create({
  asin: vine.string().regex(/^[A-Z0-9]{10}$/),
  summary: vine.string().trim().minLength(20).maxLength(500),
  idealFor: vine.string().trim().minLength(1).maxLength(300),
  notFor: vine.string().trim().minLength(1).maxLength(300),
  pros: vine.array(vine.string().trim().minLength(1).maxLength(120)).minLength(1).maxLength(5),
  cons: vine.array(vine.string().trim().minLength(1).maxLength(120)).minLength(1).maxLength(5),
  keySpecs: vine.record(vine.string().trim().maxLength(200)),
  scores: vine.record(vine.number().withoutDecimals().min(0).max(10)),
})

export type AgentDraft = Infer<typeof agentDraftValidator>
