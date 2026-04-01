import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

import { TASK_STATUSES, type TaskStatus } from '#models/task'
import tasksService from '#services/tasks_service'
import {
  createTaskValidator,
  updateTaskValidator,
} from '#validators/task_validators'

const parseTaskId = (value: string) => {
  const parsed = Number.parseInt(value, 10)

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Exception('Task id must be a positive integer', {
      code: 'E_INVALID_TASK_ID',
      status: 422,
    })
  }

  return parsed
}

const parsePriority = (value: unknown) => {
  if (value === undefined) {
    return undefined
  }

  const raw = Array.isArray(value) ? value.at(0) : value
  const parsed = Number.parseInt(String(raw), 10)

  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 10) {
    throw new Exception('Priority filter must be an integer between 0 and 10', {
      code: 'E_INVALID_PRIORITY',
      status: 422,
    })
  }

  return parsed
}

const parseStatus = (value: unknown): TaskStatus | undefined => {
  if (value === undefined) {
    return undefined
  }

  const raw = Array.isArray(value) ? value.at(0) : value

  if (typeof raw !== 'string' || !TASK_STATUSES.includes(raw as TaskStatus)) {
    throw new Exception(
      `Status filter must be one of: ${TASK_STATUSES.join(', ')}`,
      {
        code: 'E_INVALID_STATUS',
        status: 422,
      }
    )
  }

  return raw as TaskStatus
}

export default class TasksController {
  async index({ request }: HttpContext) {
    const filters = {
      priority: parsePriority(request.input('priority')),
      status: parseStatus(request.input('status')),
    }

    return tasksService.list(filters)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createTaskValidator)
    const task = await tasksService.create(payload)

    return response.status(201).send(task)
  }

  async show({ params }: HttpContext) {
    return tasksService.getOrFail(parseTaskId(params.id))
  }

  async update({ params, request }: HttpContext) {
    const payload = await request.validateUsing(updateTaskValidator)
    return tasksService.update(parseTaskId(params.id), payload)
  }

  async destroy({ params, response }: HttpContext) {
    await tasksService.delete(parseTaskId(params.id))
    return response.status(204).send('')
  }
}
