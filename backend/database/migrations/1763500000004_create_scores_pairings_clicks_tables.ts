import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Notas por criterio, productos que combinan entre sí y clics de afiliado.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.createTable('product_scores', (table) => {
      table
        .uuid('product_id')
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE')
      table.uuid('criterion_id').notNullable().references('id').inTable('rubric_criteria')
      table.smallint('score').notNullable()
      table.primary(['product_id', 'criterion_id'])
    })
    this.schema.raw(
      `ALTER TABLE product_scores ADD CONSTRAINT product_scores_range CHECK (score BETWEEN 0 AND 10)`
    )

    this.schema.createTable('product_pairings', (table) => {
      table
        .uuid('product_id')
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE')
      table
        .uuid('paired_product_id')
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE')
      table.primary(['product_id', 'paired_product_id'])
    })
    this.schema.raw(
      `ALTER TABLE product_pairings ADD CONSTRAINT product_pairings_not_self CHECK (product_id <> paired_product_id)`
    )

    this.schema.createTable('click_events', (table) => {
      table.bigIncrements('id').primary()
      table.uuid('product_id').notNullable().references('id').inTable('products')
      table.specificType('source', 'click_source').notNullable()
      table.specificType('visitor_hash', 'char(64)').nullable()
      table.timestamp('occurred_at', { useTz: true }).notNullable()
      table.index(['product_id', 'occurred_at'])
    })
  }

  async down() {
    this.schema.dropTable('click_events')
    this.schema.dropTable('product_pairings')
    this.schema.dropTable('product_scores')
  }
}
