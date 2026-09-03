import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import limiter from '@adonisjs/limiter/services/main'

import { throttleConfig } from '#config/limiter'

/**
 * Paths exempt from rate limiting. Kept in sync with the Nest template's
 * `shouldSkipThrottle`: probes, metrics scrapes and docs must stay reachable
 * even when a client has exhausted its budget.
 */
const isUnthrottledPath = (path: string) =>
  path === '/' ||
  path === '/health' ||
  path.startsWith('/health/') ||
  path === '/metrics' ||
  path === '/docs' ||
  path.startsWith('/docs/') ||
  path === '/swagger' ||
  path === '/openapi.json'

export default class ThrottleMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const path = ctx.request.url()

    if (isUnthrottledPath(path)) {
      return next()
    }

    const requestLimiter = limiter.use({
      duration: throttleConfig.duration,
      requests: throttleConfig.requests,
    })

    const key = `ip_${ctx.request.ip()}`
    const response = await requestLimiter.consume(key).catch(() => undefined)

    if (!response) {
      const availableIn = await requestLimiter.availableIn(key)
      const resetAt = Math.ceil(Date.now() / 1000) + availableIn

      ctx.response.header('Retry-After', String(availableIn))
      ctx.response.header('X-RateLimit-Limit', String(throttleConfig.requests))
      ctx.response.header('X-RateLimit-Remaining', '0')
      ctx.response.header('X-RateLimit-Reset', String(resetAt))

      return ctx.response.status(429).send({
        success: false,
        statusCode: 429,
        timestamp: new Date().toISOString(),
        path,
        method: ctx.request.method(),
        message: 'Too many requests',
        error: 'TooManyRequests',
        meta: ctx.request.id() ? { requestId: ctx.request.id() } : undefined,
      })
    }

    ctx.response.header('X-RateLimit-Limit', String(response.limit))
    ctx.response.header('X-RateLimit-Remaining', String(response.remaining))
    ctx.response.header(
      'X-RateLimit-Reset',
      String(Math.ceil(Date.now() / 1000) + response.availableIn)
    )

    return next()
  }
}
