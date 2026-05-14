import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

const API_PREFIX = '/api/v1'

const assertErrorEnvelope = (
  payload: Record<string, unknown>,
  statusCode: number,
  method: string
) => {
  if (payload.success !== false) {
    throw new Error('Expected error response success=false')
  }
  if (payload.statusCode !== statusCode) {
    throw new Error(`Expected statusCode=${statusCode}`)
  }
  if (payload.method !== method) {
    throw new Error(`Expected method=${method}`)
  }
  if (typeof payload.timestamp !== 'string') {
    throw new TypeError('Expected timestamp string')
  }
  if (typeof payload.path !== 'string') {
    throw new TypeError('Expected path string')
  }
  if (typeof payload.message !== 'string') {
    throw new TypeError('Expected message string')
  }
  if (typeof payload.error !== 'string') {
    throw new TypeError('Expected error string')
  }
  if (
    typeof payload.meta !== 'object' ||
    payload.meta === null ||
    typeof (payload.meta as { requestId?: unknown }).requestId !== 'string'
  ) {
    throw new TypeError('Expected meta.requestId string')
  }
}

test.group('Tasks endpoints', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('creates a task', async ({ client }) => {
    const response = await client.post(`${API_PREFIX}/tasks`).json({
      title: 'Test task',
      description: 'A task created from the functional suite',
      priority: 3,
    })

    response.assertStatus(201)
    response.assertBodyContains({
      title: 'Test task',
      description: 'A task created from the functional suite',
      priority: 3,
      status: 'PENDING',
    })
  })

  test('fetches, updates, and deletes a task', async ({ client }) => {
    await client.post(`${API_PREFIX}/tasks`).json({
      title: 'Task to mutate',
      priority: 1,
    })

    const task = await db.from('tasks').orderBy('id', 'desc').first()
    const taskId = task?.id

    const getResponse = await client.get(`${API_PREFIX}/tasks/${taskId}`)
    getResponse.assertStatus(200)
    getResponse.assertBodyContains({ title: 'Task to mutate' })

    const updateResponse = await client
      .patch(`${API_PREFIX}/tasks/${taskId}`)
      .json({
        status: 'IN_PROGRESS',
        title: 'Updated task title',
      })
    updateResponse.assertStatus(200)
    updateResponse.assertBodyContains({
      status: 'IN_PROGRESS',
      title: 'Updated task title',
    })

    const deleteResponse = await client.delete(`${API_PREFIX}/tasks/${taskId}`)
    deleteResponse.assertStatus(204)

    const finalGetResponse = await client.get(`${API_PREFIX}/tasks/${taskId}`)
    finalGetResponse.assertStatus(404)
  })

  test('supports status and priority filters', async ({ client }) => {
    await client.post(`${API_PREFIX}/tasks`).json({
      title: 'Low pending',
      priority: 1,
      status: 'PENDING',
    })
    await client.post(`${API_PREFIX}/tasks`).json({
      title: 'High in progress',
      priority: 5,
      status: 'IN_PROGRESS',
    })

    const response = await client.get(
      `${API_PREFIX}/tasks?status=IN_PROGRESS&priority=5`
    )

    response.assertStatus(200)
    const payload = response.body()
    if (!Array.isArray(payload.data)) {
      throw new TypeError('Expected filtered task response data to be an array')
    }
    if (payload.data.length !== 1) {
      throw new Error(
        `Expected exactly one filtered task, received ${payload.data.length}`
      )
    }
    if (payload.data[0]?.status !== 'IN_PROGRESS') {
      throw new Error('Expected filtered task status to be IN_PROGRESS')
    }
    if ((payload.data[0]?.priority ?? -1) < 5) {
      throw new Error('Expected filtered task priority to be at least 5')
    }
    if (
      payload.meta?.total !== 1 ||
      payload.meta?.page !== 1 ||
      payload.meta?.pageSize !== 20
    ) {
      throw new Error('Expected filtered task pagination metadata')
    }
  })

  test('paginates task lists', async ({ client }) => {
    await client
      .post(`${API_PREFIX}/tasks`)
      .json({ title: 'First', priority: 1 })
    await client
      .post(`${API_PREFIX}/tasks`)
      .json({ title: 'Second', priority: 2 })

    const response = await client.get(`${API_PREFIX}/tasks?page=1&pageSize=1`)

    response.assertStatus(200)
    const payload = response.body()
    if (!Array.isArray(payload.data) || payload.data.length !== 1) {
      throw new Error('Expected one task in paginated response data')
    }
    if (
      payload.meta?.total !== 2 ||
      payload.meta?.page !== 1 ||
      payload.meta?.pageSize !== 1
    ) {
      throw new Error('Expected pagination metadata to reflect page and total')
    }
  })

  test('rejects invalid payloads', async ({ client }) => {
    const response = await client.post(`${API_PREFIX}/tasks`).json({
      title: '',
      priority: 99,
    })

    response.assertStatus(422)
    assertErrorEnvelope(response.body(), 422, 'POST')
  })

  test('returns 404 for a missing task id', async ({ client }) => {
    const response = await client.get(`${API_PREFIX}/tasks/999999`)

    response.assertStatus(404)
    assertErrorEnvelope(response.body(), 404, 'GET')
  })

  test('rejects partially numeric task ids', async ({ client }) => {
    const response = await client.get(`${API_PREFIX}/tasks/123abc`)

    response.assertStatus(422)
    assertErrorEnvelope(response.body(), 422, 'GET')
  })

  test('rejects partially numeric priority filters', async ({ client }) => {
    const response = await client.get(`${API_PREFIX}/tasks?priority=5abc`)

    response.assertStatus(422)
    assertErrorEnvelope(response.body(), 422, 'GET')
  })

  test('keeps task status and priority invariants in the database', async () => {
    await db.table('tasks').insert({
      priority: 10,
      status: 'CANCELLED',
      title: 'Valid direct insert',
    })

    await db
      .table('tasks')
      .insert({
        priority: 1,
        status: 'ARCHIVED',
        title: 'Invalid status',
      })
      .then(() => {
        throw new Error('Expected invalid status insert to fail')
      })
      .catch((error: unknown) => {
        if (!(error instanceof Error)) {
          throw error
        }
        if (!error.message.includes('tasks_status_check')) {
          throw error
        }
      })

    await db
      .table('tasks')
      .insert({
        priority: 11,
        status: 'PENDING',
        title: 'Invalid priority',
      })
      .then(() => {
        throw new Error('Expected invalid priority insert to fail')
      })
      .catch((error: unknown) => {
        if (!(error instanceof Error)) {
          throw error
        }
        if (!error.message.includes('tasks_priority_check')) {
          throw error
        }
      })
  })
})
