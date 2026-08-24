import { test } from '@japa/runner'

test.group('Health endpoints', () => {
  test('reports service info', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertBodyContains({ data: { status: 'ok' } })
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

  test('serves API docs', async ({ client }) => {
    const response = await client.get('/docs')

    response.assertStatus(200)
    response.assertTextIncludes('SwaggerUIBundle')
    response.assertTextIncludes('/swagger')
  })

  test('serves OpenAPI schema', async ({ client }) => {
    const response = await client.get('/openapi.json')

    response.assertStatus(200)
    response.assertBodyContains({
      openapi: '3.0.0',
      paths: {
        '/api/v1/tasks': {},
      },
      components: {
        schemas: {
          ErrorEnvelope: {},
          SuccessEnvelope: {},
          PaginatedTaskResponse: {},
          Task: {},
        },
      },
    })

    const components = response.body().components as
      | { securitySchemes?: unknown }
      | undefined
    if (components?.securitySchemes !== undefined) {
      throw new Error(
        'Unexpected OpenAPI security schemes for unauthenticated API'
      )
    }

    // Successful payloads are documented inside the success envelope, so the
    // task list schema is an allOf of the envelope plus a paginated `data`.
    const taskListResponse =
      response.body().paths?.['/api/v1/tasks']?.get?.responses?.['200']
        ?.content?.['application/json']?.schema
    const taskListVariants = taskListResponse?.allOf as
      | { $ref?: string; properties?: { data?: { $ref?: string } } }[]
      | undefined

    if (
      taskListVariants?.[0]?.$ref !== '#/components/schemas/SuccessEnvelope'
    ) {
      throw new Error('Expected task list OpenAPI response to use the envelope')
    }
    if (
      taskListVariants?.[1]?.properties?.data?.$ref !==
      '#/components/schemas/PaginatedTaskResponse'
    ) {
      throw new Error('Expected enveloped task list data to be paginated')
    }
  })

  test('exposes prometheus metrics', async ({ client }) => {
    const response = await client.get('/metrics')

    response.assertStatus(200)
    response.assertTextIncludes('http_requests_total')
  })
})
