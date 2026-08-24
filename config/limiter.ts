import { defineConfig, stores } from '@adonisjs/limiter'
import type { InferLimiters } from '@adonisjs/limiter/types'

import env from '#start/env'

/**
 * Rate limiting is Redis-backed so the budget is shared across every instance
 * of the app, matching the Nest template's Redis throttler storage.
 */
const limiterConfig = defineConfig({
  default: 'redis',
  stores: {
    // Uses the default Redis connection declared in `config/redis.ts` ('main').
    redis: stores.redis({}),
  },
})

export default limiterConfig

/**
 * The global HTTP budget: THROTTLE_LIMIT requests per THROTTLE_TTL seconds,
 * keyed by client IP. Same defaults as the Nest template (100 / 60s).
 */
export const throttleConfig = {
  duration: env.get('THROTTLE_TTL'),
  requests: env.get('THROTTLE_LIMIT'),
}

declare module '@adonisjs/limiter/types' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- module augmentation required by @adonisjs/limiter
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
