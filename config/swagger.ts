import path from 'node:path'
import url from 'node:url'

import env from '#start/env'

export default {
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../',
  tagIndex: 2,
  productionEnv: 'production',
  info: {
    title: env.get('APP_NAME'),
    version: env.get('APP_VERSION'),
    description:
      'AdonisJS API monolith template with health, metrics, and task endpoints.',
  },
  snakeCase: false,
  debug: false,
  ignore: ['/docs', '/swagger', '/openapi.json'],
  preferredPutPatch: 'PATCH',
  common: {
    parameters: {},
    headers: {},
  },
  securitySchemes: {},
  persistAuthorization: true,
  showFullPath: false,
}
