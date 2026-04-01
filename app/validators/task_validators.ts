import vine from '@vinejs/vine'

import { TASK_STATUSES } from '#models/task'

export const createTaskValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    description: vine.string().trim().maxLength(2000).optional(),
    status: vine.enum(TASK_STATUSES).optional(),
    priority: vine.number().min(0).max(10).optional(),
  })
)

export const updateTaskValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255).optional(),
    description: vine.string().trim().maxLength(2000).optional(),
    status: vine.enum(TASK_STATUSES).optional(),
    priority: vine.number().min(0).max(10).optional(),
  })
)
