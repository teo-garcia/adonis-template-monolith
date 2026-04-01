import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { apiClient } from '@japa/api-client'
import { assert } from '@japa/assert'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import type { Config } from '@japa/runner/types'

export const plugins: Config['plugins'] = [
  assert(),
  pluginAdonisJS(app),
  apiClient(),
]

export const reporters: Config['reporters'] = {
  activated: ['spec'],
}

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [() => testUtils.db().migrate()],
  teardown: [],
}

export const configureSuite: Config['configureSuite'] = (suite) => {
  if (suite.name === 'functional') {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
