import { Exception } from '@adonisjs/core/exceptions'
import { ExceptionHandler, HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { errors as vineErrors } from '@vinejs/vine'

const requestIdMeta = (ctx: HttpContext) => {
  const requestId = ctx.request.id()
  return requestId ? { requestId } : undefined
}

const errorBody = (
  ctx: HttpContext,
  statusCode: number,
  message: string,
  error: string,
  errors?: unknown
) => ({
  success: false,
  statusCode,
  timestamp: new Date().toISOString(),
  path: ctx.request.url(),
  method: ctx.request.method(),
  message,
  error,
  ...(errors === undefined ? {} : { errors }),
  meta: requestIdMeta(ctx),
})

export default class Handler extends ExceptionHandler {
  protected debug = !app.inProduction

  protected renderStatusPages = false

  protected ignoreStatuses = [400, 401, 403, 404, 422]

  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return ctx.response
        .status(422)
        .send(
          errorBody(
            ctx,
            422,
            'Validation failed',
            'ValidationError',
            error.messages
          )
        )
    }

    if (error instanceof Exception) {
      return ctx.response
        .status(error.status)
        .send(
          errorBody(ctx, error.status, error.message, error.code ?? error.name)
        )
    }

    return super.handle(error, ctx)
  }
}
