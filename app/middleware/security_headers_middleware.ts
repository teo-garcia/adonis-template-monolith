import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class SecurityHeadersMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    ctx.response.safeHeader('referrer-policy', 'strict-origin-when-cross-origin')
    ctx.response.safeHeader('x-content-type-options', 'nosniff')
    ctx.response.safeHeader('x-frame-options', 'DENY')
    ctx.response.safeHeader('x-permitted-cross-domain-policies', 'none')
    ctx.response.safeHeader(
      'permissions-policy',
      'camera=(), geolocation=(), microphone=()'
    )

    return next()
  }
}
