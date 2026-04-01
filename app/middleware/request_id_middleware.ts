import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RequestIdMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const requestId = ctx.request.id()
    if (requestId) {
      ctx.response.safeHeader('x-request-id', requestId)
    }
    return next()
  }
}
