import db from '@adonisjs/lucid/services/db'
import redis from '@adonisjs/redis/services/main'

import env from '#start/env'

/**
 * Shared health contract.
 *
 * Deliberately identical to the frontend templates' `lib/health.ts` and to the
 * Nest template's `health.contract.ts`, so one client parser works against
 * every template in the portfolio.
 */
export type HealthStatus = 'ok' | 'degraded' | 'down'

export type HealthCheckState = 'up' | 'down'

export interface HealthResponse {
  status: HealthStatus
  timestamp: string
  version: string
  checks?: Record<string, HealthCheckState>
}

/**
 * Aggregates individual dependency checks into the overall status:
 * every check up -> `ok`, some up -> `degraded`, none up -> `down`.
 */
export const resolveHealthStatus = (
  checks: Record<string, HealthCheckState>
): HealthStatus => {
  const states = Object.values(checks)

  if (states.length === 0 || states.every((state) => state === 'up')) {
    return 'ok'
  }

  if (states.every((state) => state === 'down')) {
    return 'down'
  }

  return 'degraded'
}

class ReadinessService {
  async #checkDatabase(): Promise<HealthCheckState> {
    try {
      await db.rawQuery('select 1 as health')
      return 'up'
    } catch {
      return 'down'
    }
  }

  async #checkRedis(): Promise<HealthCheckState> {
    try {
      await redis.ping()
      return 'up'
    } catch {
      return 'down'
    }
  }

  livenessReport(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: env.get('APP_VERSION'),
    }
  }

  async report(): Promise<HealthResponse> {
    const [database, redisState] = await Promise.all([
      this.#checkDatabase(),
      this.#checkRedis(),
    ])
    const checks: Record<string, HealthCheckState> = {
      database,
      redis: redisState,
    }

    return {
      status: resolveHealthStatus(checks),
      timestamp: new Date().toISOString(),
      version: env.get('APP_VERSION'),
      checks,
    }
  }
}

export default new ReadinessService()
