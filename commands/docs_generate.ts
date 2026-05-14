import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import AutoSwaggerModule from 'adonis-autoswagger'

import swagger from '#config/swagger'
import { getSwaggerRoutes } from '#services/swagger_routes_service'

const AutoSwagger = AutoSwaggerModule.default

export default class DocsGenerate extends BaseCommand {
  static readonly commandName = 'docs:generate'
  static readonly description =
    'Generate static OpenAPI artifacts for production builds'
  static readonly options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const commandRouter = await this.app.container.make('router')

    await AutoSwagger.writeFile(getSwaggerRoutes(commandRouter), swagger)
    this.logger.success('Generated swagger.yml and swagger.json')
  }
}
