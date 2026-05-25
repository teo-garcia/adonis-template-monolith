import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import type { NextFn } from '@adonisjs/core/types/http'
import { trace } from '@opentelemetry/api'

export default class LoggingMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const startedAt = process.hrtime.bigint()

    try {
      return await next()
    } finally {
      const spanContext = trace.getActiveSpan()?.spanContext()
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000

      logger.info(
        {
          duration_ms: Number(durationMs.toFixed(2)),
          method: ctx.request.method(),
          path: ctx.request.url(),
          request_id: ctx.request.id(),
          status: ctx.response.response.statusCode,
          ...(spanContext && {
            span_id: spanContext.spanId,
            trace_id: spanContext.traceId,
          }),
        },
        'request'
      )
    }
  }
}
