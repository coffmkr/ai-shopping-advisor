/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| Las variables compartidas del proyecto (claves de proveedores, base de datos,
| tag de afiliado) viven en el archivo de entorno de la raíz del repositorio.
| Se cargan primero en process.env, sin sobrescribir lo que ya venga del
| entorno, y luego AdonisJS lee el archivo propio de backend/ (APP_KEY, PORT…).
|
*/

import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Env } from '@adonisjs/core/env'

const rootEnvFile = fileURLToPath(new URL('../../.env', import.meta.url))
if (existsSync(rootEnvFile)) {
  process.loadEnvFile(rootEnvFile)
}

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  // Base de datos
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),
  DB_TEST_DATABASE: Env.schema.string(),

  // Amazon Afiliados
  AMAZON_TAG: Env.schema.string(),

  // Canopy (datos de amazon.com por MCP)
  CANOPY_API_KEY: Env.schema.secret.optional(),
  CANOPY_MCP_URL: Env.schema.string({ format: 'url', tld: false }),
  CANOPY_MAX_SEARCHES_PER_DAY: Env.schema.number(),

  // Claude API (agente buscador)
  ANTHROPIC_API_KEY: Env.schema.secret.optional(),
  AGENT_MODEL: Env.schema.string(),

  // Administrador de prueba de la semilla
  ADMIN_EMAIL: Env.schema.string({ format: 'email' }),
  ADMIN_PASSWORD: Env.schema.secret(),
})
