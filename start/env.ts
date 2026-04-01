/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also casts values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  HOST: Env.schema.string({ format: 'host' }),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  APP_NAME: Env.schema.string(),
  APP_VERSION: Env.schema.string(),
  API_PREFIX: Env.schema.string(),
  LOG_LEVEL: Env.schema.enum([
    'fatal',
    'error',
    'warn',
    'info',
    'debug',
    'trace',
    'silent',
  ] as const),
  DB_CONNECTION: Env.schema.enum(['postgres'] as const),
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string(),
  DB_DATABASE: Env.schema.string(),
  DB_DEBUG: Env.schema.boolean(),
  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PORT: Env.schema.number(),
  REDIS_PASSWORD: Env.schema.string.optional(),
  REDIS_DB: Env.schema.number(),
  CORS_ENABLED: Env.schema.boolean(),
  CORS_ORIGIN: Env.schema.string(),
  METRICS_ENABLED: Env.schema.boolean(),
})
