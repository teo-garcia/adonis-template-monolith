import { errors as vineErrors } from '@vinejs/vine'
import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class Handler extends ExceptionHandler {
  protected debug = !app.inProduction

  protected renderStatusPages = false

  protected ignoreStatuses = [400, 401, 403, 404, 422]

  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return ctx.response.status(422).send({
        message: 'Validation failed',
        errors: error.messages,
      })
    }

    if (error instanceof Exception) {
      return ctx.response.status(error.status).send({
        code: error.code,
        message: error.message,
      })
    }

    return super.handle(error, ctx)
  }
}
