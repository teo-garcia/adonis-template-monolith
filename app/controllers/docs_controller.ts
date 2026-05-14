import type { HttpContext } from '@adonisjs/core/http'
import AutoSwaggerModule from 'adonis-autoswagger'

import swagger from '#config/swagger'
import {
  generateOpenApiSchema,
  stringifyOpenApiSchema,
} from '#services/openapi_schema_service'
import { getSwaggerRoutes } from '#services/swagger_routes_service'

const AutoSwagger = AutoSwaggerModule.default

export default class DocsController {
  async index({ response }: HttpContext) {
    response.header('content-type', 'text/html; charset=utf-8')

    return response.send(AutoSwagger.ui('/swagger', swagger))
  }

  async swagger({ response }: HttpContext) {
    response.header('content-type', 'text/yaml; charset=utf-8')

    const schema = await generateOpenApiSchema(getSwaggerRoutes())
    return response.send(stringifyOpenApiSchema(schema))
  }

  async openApi() {
    return generateOpenApiSchema(getSwaggerRoutes())
  }
}
