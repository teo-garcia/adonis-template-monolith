import { writeFile } from 'node:fs/promises'

import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

import {
  generateOpenApiSchema,
  stringifyOpenApiSchema,
} from '#services/openapi_schema_service'
import { getSwaggerRoutes } from '#services/swagger_routes_service'

export default class DocsGenerate extends BaseCommand {
  static readonly commandName = 'docs:generate'
  static readonly description =
    'Generate static OpenAPI artifacts for production builds'
  static readonly options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const commandRouter = await this.app.container.make('router')
    const schema = await generateOpenApiSchema(getSwaggerRoutes(commandRouter))

    await writeFile('swagger.json', JSON.stringify(schema, null, 2))
    await writeFile('swagger.yml', stringifyOpenApiSchema(schema))
    this.logger.success('Generated swagger.yml and swagger.json')
  }
}
