import { AgentRunSchema } from '#database/schema'
import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Category from '#models/category'
import AdminUser from '#models/admin_user'
import Product from '#models/product'
import type { AgentRunStatus } from '#models/types'

export default class AgentRun extends AgentRunSchema {
  static table = 'agent_runs'

  @column()
  declare status: AgentRunStatus

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @belongsTo(() => AdminUser, { foreignKey: 'requestedById' })
  declare requestedBy: BelongsTo<typeof AdminUser>

  @hasMany(() => Product)
  declare products: HasMany<typeof Product>
}
