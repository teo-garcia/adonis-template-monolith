import type { HttpContext } from '@adonisjs/core/http'

import readinessService from '#services/readiness_service'

export default class HealthChecksController {
  async live({ response }: HttpContext) {
    return response.status(200).send({ status: 'ok' })
  }

  async ready({ response }: HttpContext) {
    const report = await readinessService.readyReport()
    return response.status(report.status === 'ok' ? 200 : 503).send(report)
  }

  async index({ response }: HttpContext) {
    const report = await readinessService.healthReport()
    return response.status(report.status === 'ok' ? 200 : 503).send(report)
  }
}
