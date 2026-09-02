import type { HttpContext } from '@adonisjs/core/http'
import AutoSwaggerModule from 'adonis-autoswagger'

import swagger from '#config/swagger'
import { generateOpenApiSchema } from '#services/openapi_schema_service'
import { getSwaggerRoutes } from '#services/swagger_routes_service'

const AutoSwagger = AutoSwaggerModule.default

export default class DocsController {
  /**
   * Swagger UI. It reads the spec from /openapi.json -- the portfolio-wide
   * spec path -- rather than a template-specific /swagger route.
   */
  async index({ response }: HttpContext) {
    response.header('content-type', 'text/html; charset=utf-8')

    return response.send(AutoSwagger.ui('/openapi.json', swagger))
  }

  async openApi() {
    return generateOpenApiSchema(getSwaggerRoutes())
  }
}
