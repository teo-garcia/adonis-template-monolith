import { BaseSeeder } from '@adonisjs/lucid/seeders'

import Task from '#models/task'

const seedTasks = [
  {
    title: 'Review onboarding checklist',
    description: 'Confirm the template health, docs, metrics, and task APIs.',
    status: 'PENDING' as const,
    priority: 3,
  },
  {
    title: 'Ship API contract polish',
    description: 'Validate pagination, errors, and OpenAPI schema examples.',
    status: 'IN_PROGRESS' as const,
    priority: 7,
  },
  {
    title: 'Archive completed setup',
    description: 'Keep a completed task available for filtering examples.',
    status: 'COMPLETED' as const,
    priority: 1,
  },
]

export default class MainSeeder extends BaseSeeder {
  async run() {
    await Task.query().delete()
    await Task.createMany(seedTasks)
  }
}
