/**
 * Tipos del dominio compartidos por modelos, servicios y validadores.
 */

export const PRODUCT_STATUSES = ['pending', 'approved', 'rejected', 'unpublished'] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]

export const AGENT_RUN_STATUSES = ['queued', 'running', 'completed', 'failed'] as const
export type AgentRunStatus = (typeof AGENT_RUN_STATUSES)[number]

export const PRICE_TIERS = ['budget', 'mid', 'premium'] as const
export type PriceTier = (typeof PRICE_TIERS)[number]

export const CLICK_SOURCES = ['listing', 'detail', 'compare'] as const
export type ClickSource = (typeof CLICK_SOURCES)[number]

export const BADGES = ['best_rated', 'best_value', 'premium_pick', 'editor_choice'] as const
export type Badge = (typeof BADGES)[number]

export type KeySpecs = Record<string, string>

/** Columna jsonb: se guarda como texto JSON y PostgreSQL la devuelve ya parseada. */
export const jsonColumn = {
  prepare: (value: unknown) => JSON.stringify(value ?? null),
}
