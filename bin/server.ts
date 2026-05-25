/*
|--------------------------------------------------------------------------
| HTTP server entrypoint
|--------------------------------------------------------------------------
|
| The "server.ts" file is the entrypoint for starting the AdonisJS HTTP
| server. Either you can run this file directly or use the "serve"
| command to run this file and monitor file changes.
|
*/

import 'reflect-metadata'

import { shutdownTelemetry, startTelemetry } from '#start/telemetry'

const APP_ROOT = new URL('../', import.meta.url)

const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }

  return import(filePath)
}

await startTelemetry()

const { Ignitor, prettyPrintError } = await import('@adonisjs/core')

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })

    app.listen('SIGTERM', () => {
      void shutdownTelemetry().finally(() => app.terminate())
    })
    app.listenIf(app.managedByPm2, 'SIGINT', () => {
      void shutdownTelemetry().finally(() => app.terminate())
    })
  })
  .httpServer()
  .start()
  .catch((error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })
