import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { SpanKind, SpanStatusCode, trace } from '@opentelemetry/api'

export default class TelemetryMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const tracer = trace.getTracer('adonis-template-monolith')
    const route = ctx.route?.pattern ?? ctx.request.url()
    const method = ctx.request.method()

    return tracer.startActiveSpan(
      `${method} ${route}`,
      {
        kind: SpanKind.SERVER,
        attributes: {
          'http.request.method': method,
          'http.route': route,
          'url.path': ctx.request.url(),
        },
      },
      async (span) => {
        try {
          const result = await next()
          const statusCode = ctx.response.response.statusCode

          span.setAttributes({
            'http.response.status_code': statusCode,
          })

          if (statusCode >= 500) {
            span.setStatus({ code: SpanStatusCode.ERROR })
          }

          return result
        } catch (error) {
          span.recordException(error as Error)
          span.setStatus({ code: SpanStatusCode.ERROR })
          throw error
        } finally {
          span.end()
        }
      }
    )
  }
}
