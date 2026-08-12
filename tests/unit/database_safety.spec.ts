import { fileURLToPath } from 'node:url'

import { test } from '@japa/runner'

import { requireTestDatabase } from '#tests/database_safety'

const envTestExamplePath = fileURLToPath(
  new URL('../../.env.test.example', import.meta.url)
)

test.group('Database test safety', () => {
  test('requires an explicit .env.test file', ({ assert }) => {
    assert.throws(
      () => requireTestDatabase(`${envTestExamplePath}.missing`, 'app_test'),
      /Missing \.env\.test file/
    )
  })

  test('rejects a database without the test suffix', ({ assert }) => {
    assert.throws(
      () => requireTestDatabase(envTestExamplePath, 'app'),
      /database "app"/
    )
  })

  test('accepts an explicit test database', ({ assert }) => {
    assert.doesNotThrow(() =>
      requireTestDatabase(envTestExamplePath, 'app_test')
    )
  })
})
