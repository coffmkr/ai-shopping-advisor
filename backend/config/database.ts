import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'

/**
 * PostgreSQL 16 en Docker Compose. Las pruebas usan siempre una base separada
 * (DB_TEST_DATABASE), nunca la de desarrollo.
 */
const database = app.inTest ? env.get('DB_TEST_DATABASE') : env.get('DB_DATABASE')

const dbConfig = defineConfig({
  connection: 'pg',

  connections: {
    pg: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database,
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      seeders: {
        paths: ['database/seeders'],
      },
      schemaGeneration: {
        enabled: true,
        rulesPaths: ['./database/schema_rules.js'],
      },
      debug: false,
    },
  },
})

export default dbConfig
