import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'

import env from '#start/env'

const databaseConfig = defineConfig({
  connection: env.get('DB_CONNECTION'),
  prettyPrintDebugQueries: !app.inProduction,
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      seeders: {
        paths: ['database/seeders'],
      },
      debug: env.get('DB_DEBUG'),
    },
  },
})

export default databaseConfig
