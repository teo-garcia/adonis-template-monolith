import db from '@adonisjs/lucid/services/db'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

const API_PREFIX = '/api'

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

    const updateResponse = await client.patch(`${API_PREFIX}/tasks/${taskId}`).json({
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
    if (!Array.isArray(payload)) {
      throw new Error('Expected filtered task response to be an array')
    }
    if (payload.length !== 1) {
      throw new Error(`Expected exactly one filtered task, received ${payload.length}`)
    }
    if (payload[0]?.status !== 'IN_PROGRESS') {
      throw new Error('Expected filtered task status to be IN_PROGRESS')
    }
    if ((payload[0]?.priority ?? -1) < 5) {
      throw new Error('Expected filtered task priority to be at least 5')
    }
  })

  test('rejects invalid payloads', async ({ client }) => {
    const response = await client.post(`${API_PREFIX}/tasks`).json({
      title: '',
      priority: 99,
    })

    response.assertStatus(422)
  })

  test('returns 404 for a missing task id', async ({ client }) => {
    const response = await client.get(`${API_PREFIX}/tasks/999999`)

    response.assertStatus(404)
  })
})
