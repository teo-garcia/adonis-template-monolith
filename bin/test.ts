/*
|--------------------------------------------------------------------------
| Test runner entrypoint
|--------------------------------------------------------------------------
|
| The "test.ts" file is the entrypoint for running the AdonisJS test
| suites using Japa. It bootstraps the application and delegates to the
| configured test runner.
|
*/

process.env.NODE_ENV = 'test'

import 'reflect-metadata'

import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { Ignitor, prettyPrintError } from '@adonisjs/core'
import { configure, processCLIArgs, run } from '@japa/runner'

import { requireTestDatabase } from '#tests/database_safety'

const APP_ROOT = new URL('../', import.meta.url)
const envTestPath = fileURLToPath(new URL('../.env.test', import.meta.url))
const envTestExamplePath = fileURLToPath(
  new URL('../.env.test.example', import.meta.url)
)
const ENV_TEST_PATH = existsSync(envTestPath) ? envTestPath : envTestExamplePath

const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }

  return import(filePath)
}

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      const { default: env } = await import('#start/env')
      requireTestDatabase(ENV_TEST_PATH, env.get('DB_DATABASE'))
    })

    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  .testRunner()
  .configure(async (app) => {
    const { runnerHooks, ...config } = await import('../tests/bootstrap.js')

    processCLIArgs(process.argv.splice(2))
    configure({
      ...app.rcFile.tests,
      ...config,
      setup: runnerHooks.setup,
      teardown: [...runnerHooks.teardown, () => app.terminate()],
    })
  })
  .run(() => run())
  .catch((error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })
