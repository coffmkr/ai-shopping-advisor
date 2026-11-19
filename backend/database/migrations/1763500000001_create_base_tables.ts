import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Enumerados, administradores, categorías y criterios de la rúbrica.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.raw(`
      CREATE TYPE agent_run_status AS ENUM ('queued', 'running', 'completed', 'failed');
      CREATE TYPE product_status AS ENUM ('pending', 'approved', 'rejected', 'unpublished');
      CREATE TYPE product_provider AS ENUM ('amazon');
      CREATE TYPE price_tier AS ENUM ('budget', 'mid', 'premium');
      CREATE TYPE click_source AS ENUM ('listing', 'detail', 'compare');
    `)

    this.schema.createTable('admin_users', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })

    this.schema.createTable('categories', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('slug', 60).notNullable().unique()
      table.string('name', 80).notNullable()
      table.string('search_term', 120).notNullable()
      table.string('icon', 60).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
    })
    this.schema.raw(
      `ALTER TABLE categories ADD CONSTRAINT categories_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')`
    )

    this.schema.createTable('rubric_criteria', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('category_id')
        .notNullable()
        .references('id')
        .inTable('categories')
        .onDelete('CASCADE')
      table.string('key', 40).notNullable()
      table.string('label', 60).notNullable()
      table.smallint('position').notNullable()
      table.unique(['category_id', 'key'])
    })
  }

  async down() {
    this.schema.dropTable('rubric_criteria')
    this.schema.dropTable('categories')
    this.schema.dropTable('admin_users')
    this.schema.raw(`
      DROP TYPE click_source;
      DROP TYPE price_tier;
      DROP TYPE product_provider;
      DROP TYPE product_status;
      DROP TYPE agent_run_status;
    `)
  }
}
