import { defineConfig } from '@adonisjs/cors'

import env from '#start/env'

const corsConfig = defineConfig({
  enabled: env.get('CORS_ENABLED'),
  origin: env.get('CORS_ENABLED') ? [env.get('CORS_ORIGIN')] : false,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  headers: true,
  exposeHeaders: ['x-request-id'],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
