import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Productos: candidatos que propone el agente y, si se aprueban, productos
 * publicados con su ficha de recomendación.
 */
export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Identidad
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .specificType('provider', 'product_provider')
        .notNullable()
        .defaultTo(this.raw(`'amazon'::product_provider`))
      table.string('provider_product_id', 20).notNullable()
      table.string('slug', 160).notNullable().unique()
      table.unique(['provider', 'provider_product_id'])

      // Relaciones
      table.uuid('category_id').notNullable().references('id').inTable('categories')
      table.uuid('agent_run_id').notNullable().references('id').inTable('agent_runs')
      table.uuid('reviewed_by_id').nullable().references('id').inTable('admin_users')

      // Datos del proveedor
      table.string('title', 500).notNullable()
      table.string('brand', 120).nullable()
      table.string('image_url', 500).nullable()
      table.decimal('rating', 2, 1).notNullable()
      table.integer('reviews_count').notNullable()
      table.decimal('reference_price_usd', 10, 2).nullable()
      table.specificType('price_tier', 'price_tier').nullable()
      table.jsonb('key_specs').notNullable().defaultTo('{}')
      table.jsonb('provider_snapshot').notNullable()
      table.timestamp('data_updated_at', { useTz: true }).notNullable()

      // Ficha de recomendación
      table.jsonb('agent_draft').notNullable()
      table.text('summary').nullable()
      table.text('ideal_for').nullable()
      table.text('not_for').nullable()
      table.jsonb('pros').notNullable().defaultTo('[]')
      table.jsonb('cons').notNullable().defaultTo('[]')
      table.jsonb('badges').notNullable().defaultTo('[]')

      // Curaduría
      table
        .specificType('status', 'product_status')
        .notNullable()
        .defaultTo(this.raw(`'pending'::product_status`))
      table.string('affiliate_url', 300).nullable()
      table.text('rejection_reason').nullable()
      table.timestamp('reviewed_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()

      table.index(['category_id', 'status'])
      table.index(['category_id', 'price_tier'])
    })

    this.schema.raw(`
      ALTER TABLE products
        ADD CONSTRAINT products_asin_format CHECK (provider_product_id ~ '^[A-Z0-9]{10}$'),
        ADD CONSTRAINT products_rating_range CHECK (rating >= 0 AND rating <= 5),
        ADD CONSTRAINT products_reviews_positive CHECK (reviews_count >= 0),
        ADD CONSTRAINT products_price_positive CHECK (reference_price_usd IS NULL OR reference_price_usd >= 0),
        ADD CONSTRAINT products_approved_sheet_complete CHECK (
          status <> 'approved' OR (
            summary IS NOT NULL AND char_length(summary) BETWEEN 20 AND 500
            AND ideal_for IS NOT NULL
            AND not_for IS NOT NULL
            AND affiliate_url IS NOT NULL
            AND jsonb_array_length(pros) >= 1
            AND jsonb_array_length(cons) >= 1
            AND reviewed_at IS NOT NULL
          )
        );
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
