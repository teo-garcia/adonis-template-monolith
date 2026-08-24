import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

import env from '#start/env'

/**
 * Paths that return their payload verbatim. Mirrors the Nest template's
 * `TransformInterceptor`, which skips `/metrics` and `/health*` because those
 * shapes are consumed by Prometheus and orchestrator probes. The docs routes
 * are listed here too: in Nest they are served by Swagger middleware that never
 * reaches the interceptor, so skipping them keeps the two templates equivalent.
 */
const isUnwrappedPath = (path: string) =>
  path === '/metrics' ||
  path.startsWith('/health') ||
  path === '/docs' ||
  path.startsWith('/docs/') ||
  path === '/swagger' ||
  path === '/openapi.json'

/**
 * Wraps successful responses in the shared success envelope:
 *
 *   { success, statusCode, timestamp, path, method, data, meta }
 *
 * Errors are untouched -- `app/exceptions/handler.ts` already emits the
 * matching error envelope, so failures never reach this middleware's wrap.
 */
export default class ResponseEnvelopeMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const startedAt = process.hrtime.bigint()
    const path = ctx.request.url()

    await next()

    if (isUnwrappedPath(path)) {
      return
    }

    const statusCode = ctx.response.getStatus()

    // 204 must not carry a body, and anything already failed is an error
    // envelope produced by the exception handler.
    if (statusCode === 204 || statusCode >= 400) {
      return
    }

    if (!ctx.response.hasContent) {
      return
    }

    const data = ctx.response.getBody()

    // Streams and buffers (file downloads) are passed through untouched.
    if (Buffer.isBuffer(data) || typeof data === 'string') {
      return
    }

    const requestId = ctx.request.id()
    const duration = Number(process.hrtime.bigint() - startedAt) / 1_000_000

    ctx.response.send({
      success: true,
      statusCode,
      timestamp: new Date().toISOString(),
      path,
      method: ctx.request.method(),
      data,
      meta: {
        requestId,
        version: env.get('APP_VERSION'),
        duration: Math.round(duration),
      },
    })
  }
}
