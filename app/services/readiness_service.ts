import db from '@adonisjs/lucid/services/db'
import redis from '@adonisjs/redis/services/main'

class ReadinessService {
  async #checkDatabase(): Promise<'ok' | 'error'> {
    try {
      await db.rawQuery('select 1 as health')
      return 'ok'
    } catch (error) {
      return 'error'
    }
  }

  async #checkRedis(): Promise<'ok' | 'error'> {
    try {
      await redis.ping()
      return 'ok'
    } catch (error) {
      return 'error'
    }
  }

  async readyReport() {
    const [database, redisStatus] = await Promise.all([
      this.#checkDatabase(),
      this.#checkRedis(),
    ])
    const checks = {
      database,
      redis: redisStatus,
    }
    const isHealthy = Object.values(checks).every((value) => value === 'ok')

    return {
      checks,
      status: isHealthy ? 'ok' : 'error',
    }
  }

  async healthReport() {
    const report = await this.readyReport()

    return {
      checks: report.checks,
      status: report.status === 'ok' ? 'ok' : 'degraded',
    }
  }
}

export default new ReadinessService()
