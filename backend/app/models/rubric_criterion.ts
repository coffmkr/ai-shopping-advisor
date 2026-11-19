import { RubricCriterionSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Category from '#models/category'

export default class RubricCriterion extends RubricCriterionSchema {
  static table = 'rubric_criteria'

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>
}
