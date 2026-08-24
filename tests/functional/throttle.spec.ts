import limiter from '@adonisjs/limiter/services/main'
import { test } from '@japa/runner'

import { throttleConfig } from '#config/limiter'

const API_PREFIX = '/api/v1'

test.group('Rate limiting', (group) => {
  group.each.setup(() => limiter.clear())

  test('sets rate limit headers on API routes', async ({ client }) => {
    const response = await client.get(`${API_PREFIX}/tasks`)

    response.assertStatus(200)
    response.assertHeader('x-ratelimit-limit', String(throttleConfig.requests))

    const remaining = Number(response.header('x-ratelimit-remaining'))
    if (!Number.isInteger(remaining) || remaining >= throttleConfig.requests) {
      throw new Error(
        `Expected x-ratelimit-remaining below the limit, got "${remaining}"`
      )
    }
  })

  test('decrements the remaining budget across requests', async ({
    client,
  }) => {
    const first = await client.get(`${API_PREFIX}/tasks`)
    const second = await client.get(`${API_PREFIX}/tasks`)

    const firstRemaining = Number(first.header('x-ratelimit-remaining'))
    const secondRemaining = Number(second.header('x-ratelimit-remaining'))

    if (secondRemaining !== firstRemaining - 1) {
      throw new Error(
        `Expected the budget to decrement, got ${firstRemaining} then ${secondRemaining}`
      )
    }
  })

  test('answers with 429 and the error envelope once exhausted', async ({
    client,
  }) => {
    for (let attempt = 0; attempt < throttleConfig.requests; attempt += 1) {
      await client.get(`${API_PREFIX}/tasks`)
    }

    const response = await client.get(`${API_PREFIX}/tasks`)

    response.assertStatus(429)
    response.assertHeader('x-ratelimit-remaining', '0')
    response.assertBodyContains({
      success: false,
      statusCode: 429,
      error: 'TooManyRequests',
      message: 'Too many requests',
    })

    if (!response.header('retry-after')) {
      throw new Error('Expected a Retry-After header on a throttled response')
    }
  })

  test('never throttles probes, metrics or docs', async ({ client }) => {
    for (const path of [
      '/',
      '/health',
      '/health/live',
      '/health/ready',
      '/metrics',
      '/openapi.json',
    ]) {
      const response = await client.get(path)

      if (response.header('x-ratelimit-limit') !== undefined) {
        throw new Error(`Expected "${path}" to be exempt from rate limiting`)
      }
    }
  })
})
