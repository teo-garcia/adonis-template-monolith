import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table.string('status', 32).notNullable().defaultTo('PENDING').index()
      table.integer('priority').notNullable().defaultTo(0).index()
      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(this.now())
      table
        .timestamp('updated_at', { useTz: true })
        .notNullable()
        .defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
