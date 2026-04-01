import { HttpContext } from '@adonisjs/core/http'
import { Logger } from '@adonisjs/core/logger'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Bind request-scoped values to the container so the app can resolve
 * HttpContext-aware services when needed.
 */
export default class ContainerBindingsMiddleware {
  handle(ctx: HttpContext, next: NextFn) {
    ctx.containerResolver.bindValue(HttpContext, ctx)
    ctx.containerResolver.bindValue(Logger, ctx.logger)
    return next()
  }
}
