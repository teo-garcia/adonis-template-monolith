/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

import env from '#start/env'

const HealthChecksController = () =>
  import('#controllers/health_checks_controller')
const MetricsController = () => import('#controllers/metrics_controller')
const TasksController = () => import('#controllers/tasks_controller')
const DocsController = () => import('#controllers/docs_controller')
const trimSlashes = (value: string) => {
  let start = 0
  let end = value.length

  while (value[start] === '/') {
    start += 1
  }

  while (value[end - 1] === '/') {
    end -= 1
  }

  return value.slice(start, end)
}
const apiPrefix = trimSlashes(env.get('API_PREFIX'))

router.get('/', async () => {
  return {
    name: env.get('APP_NAME'),
    status: 'ok',
    version: env.get('APP_VERSION'),
  }
})

router.get('/health', [HealthChecksController, 'index'])
router.get('/health/live', [HealthChecksController, 'live'])
router.get('/health/ready', [HealthChecksController, 'ready'])
router.get('/docs', [DocsController, 'index'])
router.get('/swagger', [DocsController, 'swagger'])
router.get('/openapi.json', [DocsController, 'openApi'])
router.get('/metrics', [MetricsController, 'index'])

router
  .group(() => {
    router.get('/tasks', [TasksController, 'index'])
    router.post('/tasks', [TasksController, 'store'])
    router.get('/tasks/:id', [TasksController, 'show'])
    router.patch('/tasks/:id', [TasksController, 'update'])
    router.delete('/tasks/:id', [TasksController, 'destroy'])
  })
  .prefix(`/${apiPrefix}`)
