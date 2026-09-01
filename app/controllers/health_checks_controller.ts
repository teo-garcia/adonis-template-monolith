import type { HttpContext } from '@adonisjs/core/http'

import readinessService from '#services/readiness_service'

export default class HealthChecksController {
  /**
   * Liveness: the process is up. No dependency checks, so a slow database
   * never triggers a container restart.
   */
  async live({ response }: HttpContext) {
    return response.status(200).send(readinessService.livenessReport())
  }

  /**
   * Readiness: dependencies are reachable. A degraded or down report answers
   * 503 so load balancers take the instance out of rotation.
   */
  async ready({ response }: HttpContext) {
    return this.#respond(response)
  }

  async index({ response }: HttpContext) {
    return this.#respond(response)
  }

  async #respond(response: HttpContext['response']) {
    const report = await readinessService.report()

    return response.status(report.status === 'ok' ? 200 : 503).send(report)
  }
}
