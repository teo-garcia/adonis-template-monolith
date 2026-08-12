import { existsSync } from 'node:fs'

export function requireTestDatabase(envTestPath: string, databaseName: string) {
  if (!existsSync(envTestPath)) {
    throw new Error(
      'Missing .env.test file. Copy .env.test.example to .env.test before running database tests.'
    )
  }

  if (!databaseName.endsWith('_test')) {
    throw new Error(
      `Refusing to run destructive test setup against database ${JSON.stringify(databaseName)}. ` +
        "DB_DATABASE must name a database ending in '_test'."
    )
  }
}
