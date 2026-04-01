import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

import metricsService from '#services/metrics_service'
import env from '#start/env'

export default class MetricsMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (!env.get('METRICS_ENABLED')) {
      return next()
    }

    const startedAt = process.hrtime.bigint()
    const route = ctx.route?.pattern ?? ctx.request.url()
    const method = ctx.request.method()

    ctx.response.response.once('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000

      metricsService.record({
        durationMs,
        method,
        route,
        status: ctx.response.response.statusCode,
      })
    })

    return next()
  }
}
