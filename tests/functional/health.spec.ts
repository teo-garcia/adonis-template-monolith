import { test } from '@japa/runner'

test.group('Health endpoints', () => {
  test('reports service info', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertBodyContains({ status: 'ok' })
  })

  test('reports liveness', async ({ client }) => {
    const response = await client.get('/health/live')

    response.assertStatus(200)
    response.assertBody({ status: 'ok' })
  })

  test('reports readiness', async ({ client }) => {
    const response = await client.get('/health/ready')

    response.assertStatus(200)
    response.assertBody({
      checks: {
        database: 'ok',
        redis: 'ok',
      },
      status: 'ok',
    })
  })

  test('reports docs discoverability', async ({ client }) => {
    const response = await client.get('/docs')

    response.assertStatus(200)
    response.assertBodyContains({
      docs: {
        enabled: false,
      },
      status: 'ok',
    })
  })

  test('exposes prometheus metrics', async ({ client }) => {
    const response = await client.get('/metrics')

    response.assertStatus(200)
    response.assertTextIncludes('http_requests_total')
  })
})
