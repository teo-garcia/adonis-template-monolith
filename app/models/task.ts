import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

export default class Task extends BaseModel {
  static readonly table = 'tasks'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  // @enum(PENDING, IN_PROGRESS, COMPLETED)
  declare status: TaskStatus

  @column()
  // @props({"minimum":0,"maximum":10})
  declare priority: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
