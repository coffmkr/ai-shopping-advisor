import { ProductSchema } from '#database/schema'
import { belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Category from '#models/category'
import AgentRun from '#models/agent_run'
import RubricCriterion from '#models/rubric_criterion'
import {
  jsonColumn,
  type Badge,
  type KeySpecs,
  type PriceTier,
  type ProductStatus,
} from '#models/types'

export default class Product extends ProductSchema {
  static table = 'products'

  @column()
  declare status: ProductStatus

  @column()
  declare priceTier: PriceTier | null

  @column()
  declare provider: 'amazon'

  @column(jsonColumn)
  declare keySpecs: KeySpecs

  @column(jsonColumn)
  declare providerSnapshot: Record<string, unknown>

  @column(jsonColumn)
  declare agentDraft: Record<string, unknown>

  @column(jsonColumn)
  declare pros: string[]

  @column(jsonColumn)
  declare cons: string[]

  @column(jsonColumn)
  declare badges: Badge[]

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @belongsTo(() => AgentRun)
  declare agentRun: BelongsTo<typeof AgentRun>

  /** Nota del asesor por criterio (tabla product_scores, columna score). */
  @manyToMany(() => RubricCriterion, {
    pivotTable: 'product_scores',
    pivotForeignKey: 'product_id',
    pivotRelatedForeignKey: 'criterion_id',
    pivotColumns: ['score'],
  })
  declare scores: ManyToMany<typeof RubricCriterion>

  /** "Combina bien con" (tabla product_pairings). */
  @manyToMany(() => Product, {
    pivotTable: 'product_pairings',
    pivotForeignKey: 'product_id',
    pivotRelatedForeignKey: 'paired_product_id',
  })
  declare pairings: ManyToMany<typeof Product>

  get asin() {
    return this.providerProductId
  }
}
