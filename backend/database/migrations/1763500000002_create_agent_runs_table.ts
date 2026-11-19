import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Búsquedas del agente. Cada producto nace de una búsqueda (las de la semilla
 * se marcan con is_seed). Solo puede haber una búsqueda activa por categoría.
 */
export default class extends BaseSchema {
  protected tableName = 'agent_runs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('category_id').notNullable().references('id').inTable('categories')
      table.uuid('requested_by_id').notNullable().references('id').inTable('admin_users')
      table.decimal('max_price_usd', 10, 2).nullable()
      table
        .specificType('status', 'agent_run_status')
        .notNullable()
        .defaultTo(this.raw(`'queued'::agent_run_status`))
      table.boolean('is_seed').notNullable().defaultTo(false)
      table.integer('provider_requests').notNullable().defaultTo(0)
      table.integer('candidates_created').notNullable().defaultTo(0)
      table.text('error_message').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('started_at', { useTz: true }).nullable()
      table.timestamp('finished_at', { useTz: true }).nullable()
      table.index(['status', 'created_at'])
    })

    this.schema.raw(`
      ALTER TABLE agent_runs ADD CONSTRAINT agent_runs_max_price_positive CHECK (max_price_usd IS NULL OR max_price_usd >= 0);
      CREATE UNIQUE INDEX agent_runs_one_active_per_category
        ON agent_runs (category_id) WHERE status IN ('queued', 'running');
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
