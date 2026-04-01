import Task, { type TaskStatus } from '#models/task'
import { Exception } from '@adonisjs/core/exceptions'
import logger from '@adonisjs/core/services/logger'

export interface TaskFilters {
  priority?: number
  status?: TaskStatus
}

export interface CreateTaskPayload {
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: number
}

export interface UpdateTaskPayload {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: number
}

class TasksService {
  async create(payload: CreateTaskPayload) {
    logger.info({ title: payload.title }, 'Creating task')

    return Task.create({
      title: payload.title,
      description: payload.description ?? null,
      status: payload.status ?? 'PENDING',
      priority: payload.priority ?? 0,
    })
  }

  async list(filters: TaskFilters) {
    logger.debug({ filters }, 'Listing tasks')

    const query = Task.query()
      .orderBy('priority', 'desc')
      .orderBy('created_at', 'desc')

    if (filters.status) {
      query.where('status', filters.status)
    }

    if (filters.priority !== undefined) {
      query.where('priority', '>=', filters.priority)
    }

    return await query
  }

  async getOrFail(id: number) {
    const task = await Task.find(id)

    if (!task) {
      throw new Exception(`Task with ID ${id} not found`, {
        code: 'E_TASK_NOT_FOUND',
        status: 404,
      })
    }

    return task
  }

  async update(id: number, payload: UpdateTaskPayload) {
    logger.info({ id }, 'Updating task')

    const task = await this.getOrFail(id)
    task.merge(payload)
    await task.save()

    return task
  }

  async delete(id: number) {
    logger.info({ id }, 'Deleting task')

    const task = await this.getOrFail(id)
    await task.delete()
  }
}

export default new TasksService()
