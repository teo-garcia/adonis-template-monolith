import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from 'prom-client'

interface RequestMetric {
  durationMs: number
  method: string
  route: string
  status: number
}

/**
 * Prometheus metrics.
 *
 * Uses prom-client rather than hand-rolled counters so this template exposes
 * the same series as the other backends: a duration *histogram* (the previous
 * sum/count pair could not answer p95/p99) plus default process metrics.
 */
class MetricsService {
  readonly registry = new Registry()

  readonly #requests: Counter<string>
  readonly #duration: Histogram<string>

  constructor() {
    this.registry.setDefaultLabels({ app: 'adonis-monolith' })

    this.#requests = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    })

    this.#duration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    })

    collectDefaultMetrics({ register: this.registry })
  }

  record({ durationMs, method, route, status }: RequestMetric) {
    const labels = { method, route, status: String(status) }

    this.#requests.inc(labels)
    this.#duration.observe(labels, durationMs / 1000)
  }

  async render() {
    return this.registry.metrics()
  }

  get contentType() {
    return this.registry.contentType
  }
}

export default new MetricsService()
