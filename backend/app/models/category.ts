import { CategorySchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import RubricCriterion from '#models/rubric_criterion'
import Product from '#models/product'

export default class Category extends CategorySchema {
  static table = 'categories'

  @hasMany(() => RubricCriterion)
  declare criteria: HasMany<typeof RubricCriterion>

  @hasMany(() => Product)
  declare products: HasMany<typeof Product>
}
