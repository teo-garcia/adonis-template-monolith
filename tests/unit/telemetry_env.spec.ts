import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { test } from '@japa/runner'

async function runTelemetry(
  enabled: boolean,
  endpoint: string
): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'adonis-telemetry-env-'))
  const fixture = await readFile('.env.test.example', 'utf8')
  await writeFile(
    join(directory, '.env'),
    `${fixture}\nOTEL_ENABLED=${enabled}\nOTEL_SERVICE_NAME=env-file-service\nAPP_VERSION=env-file-version\nOTEL_EXPORTER_OTLP_TRACES_ENDPOINT=${endpoint}\n`
  )
  const env = { ...process.env }
  for (const line of fixture.split('\n')) {
    const key = line.match(/^([A-Z_]+)=/)?.[1]
    if (key) delete env[key]
  }
  for (const key of Object.keys(env)) {
    if (key.startsWith('OTEL_')) delete env[key]
  }
  env.ENV_PATH = directory
  env.NODE_ENV = 'test'
  env.OTEL_NODE_RESOURCE_DETECTORS = 'none'

  try {
    const child = spawn(
      process.execPath,
      [
        '--import=@poppinss/ts-exec',
        '--input-type=module',
        '--eval',
        `
        const { startTelemetry, shutdownTelemetry } = await import('./start/telemetry.ts');
        await startTelemetry();
        const { trace } = await import('@opentelemetry/api');
        const span = trace.getTracer('env-regression').startSpan('env-regression');
        console.log(JSON.stringify({ recording: span.isRecording() }));
        span.end();
        const { createRequire } = await import('node:module');
        const http = createRequire(import.meta.url)('node:http');
        const server = http.createServer((_request, response) => response.end('ok'));
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        await new Promise((resolve, reject) => {
          http.get('http://127.0.0.1:' + server.address().port + '/', response => {
            response.resume();
            response.on('end', resolve);
          }).on('error', reject);
        });
        await new Promise(resolve => server.close(resolve));
        await shutdownTelemetry();
        `,
      ],
      { env, stdio: ['ignore', 'pipe', 'pipe'], timeout: 30_000 }
    )
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk: Buffer) => (stdout += chunk.toString()))
    child.stderr.on('data', (chunk: Buffer) => (stderr += chunk.toString()))
    const code = await new Promise<number | null>((resolve, reject) => {
      child.once('error', reject)
      child.once('exit', resolve)
    })
    if (code !== 0) throw new Error(`Telemetry child failed: ${stderr}`)
    return stdout
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

test.group('Telemetry environment', () => {
  test('honors disabled telemetry from the native environment file', async ({
    assert,
  }) => {
    const output = await runTelemetry(false, 'http://127.0.0.1:1/v1/traces')
    assert.include(output, '"recording":false')
  }).timeout(40_000)

  test('exports HTTP spans using the file service, version and endpoint', async ({
    assert,
  }) => {
    const payloads: Buffer[] = []
    const collector = createServer((request, response) => {
      const chunks: Buffer[] = []
      request.on('data', (chunk: Buffer) => chunks.push(chunk))
      request.on('end', () => {
        payloads.push(Buffer.concat(chunks))
        response.writeHead(200, { 'Content-Type': 'application/x-protobuf' })
        response.end()
      })
    })
    await new Promise<void>((resolve) =>
      collector.listen(0, '127.0.0.1', resolve)
    )
    const address = collector.address()
    if (!address || typeof address === 'string') {
      throw new Error('Expected a TCP collector address')
    }
    try {
      const output = await runTelemetry(
        true,
        `http://127.0.0.1:${address.port}/v1/traces`
      )
      assert.include(output, '"recording":true')
      const payload = Buffer.concat(payloads).toString('utf8')
      assert.include(payload, '@opentelemetry/instrumentation-http')
      assert.include(payload, 'env-file-service')
      assert.include(payload, 'env-file-version')
    } finally {
      await new Promise<void>((resolve, reject) =>
        collector.close((error) => (error ? reject(error) : resolve()))
      )
    }
  }).timeout(40_000)
})
