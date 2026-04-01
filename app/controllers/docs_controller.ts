import env from '#start/env'

export default class DocsController {
  async index() {
    return {
      docs: {
        enabled: false,
        message: 'OpenAPI docs are not configured for this template yet.',
      },
      name: env.get('APP_NAME'),
      status: 'ok',
      version: env.get('APP_VERSION'),
    }
  }
}
