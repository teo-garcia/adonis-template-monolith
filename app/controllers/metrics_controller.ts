import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

import metricsService from '#services/metrics_service'
import env from '#start/env'

export default class MetricsController {
  async index({ response }: HttpContext) {
    if (!env.get('METRICS_ENABLED')) {
      throw new Exception('Metrics endpoint is disabled', {
        code: 'E_METRICS_DISABLED',
        status: 404,
      })
    }

    response.header('content-type', metricsService.contentType)

    return metricsService.render()
  }
}
