interface MetricSample {
  count: number
  durationSecondsTotal: number
}

interface RequestMetric {
  durationMs: number
  method: string
  route: string
  status: number
}

const escapeLabel = (value: string) =>
  value.replaceAll('\\', '\\\\').replaceAll('"', String.raw`\"`)

class MetricsService {
  #samples = new Map<string, MetricSample>()

  record({ durationMs, method, route, status }: RequestMetric) {
    const key = JSON.stringify({ method, route, status })
    const sample = this.#samples.get(key) ?? {
      count: 0,
      durationSecondsTotal: 0,
    }

    sample.count += 1
    sample.durationSecondsTotal += durationMs / 1000

    this.#samples.set(key, sample)
  }

  render() {
    const lines = [
      '# HELP http_requests_total Total number of HTTP requests',
      '# TYPE http_requests_total counter',
      '# HELP http_request_duration_seconds_sum Total HTTP request duration in seconds',
      '# TYPE http_request_duration_seconds_sum counter',
      '# HELP http_request_duration_seconds_count Total HTTP request samples',
      '# TYPE http_request_duration_seconds_count counter',
    ]

    for (const [key, sample] of this.#samples.entries()) {
      const labels = JSON.parse(key) as {
        method: string
        route: string
        status: number
      }

      const labelSet = `method="${escapeLabel(labels.method)}",route="${escapeLabel(
        labels.route
      )}",status="${labels.status}"`

      lines.push(
        `http_requests_total{${labelSet}} ${sample.count}`,
        `http_request_duration_seconds_sum{${labelSet}} ${sample.durationSecondsTotal.toFixed(
          6
        )}`,
        `http_request_duration_seconds_count{${labelSet}} ${sample.count}`
      )
    }

    return `${lines.join('\n')}\n`
  }
}

export default new MetricsService()
