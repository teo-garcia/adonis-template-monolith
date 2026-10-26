import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'

import env from '#start/env'

let sdk: NodeSDK | undefined

export async function startTelemetry(): Promise<void> {
  if (!env.get('OTEL_ENABLED', true) || sdk) {
    return
  }

  const serviceName = env.get('OTEL_SERVICE_NAME', 'adonis-template-monolith')
  const serviceVersion = env.get('APP_VERSION', '1')
  const endpoint = env.get(
    'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT',
    'http://localhost:4318/v1/traces'
  )

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: serviceVersion,
    }),
    traceExporter: new OTLPTraceExporter({ url: endpoint }),
    instrumentations: [getNodeAutoInstrumentations()],
  })

  await sdk.start()
}

export async function shutdownTelemetry(): Promise<void> {
  await sdk?.shutdown()
}
