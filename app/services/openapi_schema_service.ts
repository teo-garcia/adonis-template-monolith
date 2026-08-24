import AutoSwaggerModule from 'adonis-autoswagger'

import swagger from '#config/swagger'

const AutoSwagger = AutoSwaggerModule.default

type OpenApiComponents = {
  schemas?: Record<string, unknown>
  securitySchemes?: Record<string, unknown>
  [key: string]: unknown
}

type OpenApiResponse = {
  description?: string
  content?: Record<string, unknown>
  [key: string]: unknown
}

type OpenApiOperation = {
  responses?: Record<string, OpenApiResponse>
  [key: string]: unknown
}

type OpenApiDocument = {
  components?: OpenApiComponents
  paths?: Record<string, Record<string, OpenApiOperation>>
  [key: string]: unknown
}

const ERROR_SCHEMA_REFERENCE = {
  $ref: '#/components/schemas/ErrorEnvelope',
}

const JSON_SCHEMA_CONTENT = (schema: unknown) => ({
  'application/json': {
    schema,
  },
})

const SUCCESS_STATUS_CODES = new Set(['200', '201'])

const ERROR_STATUS_CODES = new Set([
  '400',
  '401',
  '403',
  '404',
  '409',
  '422',
  '429',
  '500',
])

const ensureComponents = (schema: OpenApiDocument) => {
  schema.components ??= {}
  schema.components.schemas ??= {}

  return schema.components.schemas
}

const addContractSchemas = (schema: OpenApiDocument) => {
  const schemas = ensureComponents(schema)

  schemas.PaginationMeta = {
    type: 'object',
    required: ['total', 'page', 'pageSize'],
    properties: {
      total: { type: 'integer', minimum: 0 },
      page: { type: 'integer', minimum: 1 },
      pageSize: { type: 'integer', minimum: 1, maximum: 100 },
    },
  }
  schemas.PaginatedTaskResponse = {
    type: 'object',
    required: ['data', 'meta'],
    properties: {
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/Task' },
      },
      meta: { $ref: '#/components/schemas/PaginationMeta' },
    },
  }
  schemas.SuccessEnvelope = {
    type: 'object',
    required: ['success', 'statusCode', 'timestamp', 'path', 'method', 'data'],
    properties: {
      success: { type: 'boolean', enum: [true] },
      statusCode: { type: 'integer', minimum: 200, maximum: 399 },
      timestamp: { type: 'string', format: 'date-time' },
      path: { type: 'string' },
      method: { type: 'string' },
      data: {},
      meta: {
        type: 'object',
        properties: {
          requestId: { type: 'string' },
          version: { type: 'string' },
          duration: { type: 'integer', minimum: 0 },
        },
      },
    },
  }
  schemas.ErrorEnvelope = {
    type: 'object',
    required: [
      'success',
      'statusCode',
      'timestamp',
      'path',
      'method',
      'message',
      'error',
    ],
    properties: {
      success: { type: 'boolean', enum: [false] },
      statusCode: { type: 'integer', minimum: 400 },
      timestamp: { type: 'string', format: 'date-time' },
      path: { type: 'string' },
      method: { type: 'string' },
      message: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
      },
      error: { type: 'string' },
      errors: { type: 'object' },
      meta: {
        type: 'object',
        properties: {
          requestId: { type: 'string' },
        },
      },
    },
  }
}

const patchResponseSchema = (response: OpenApiResponse, schema: unknown) => {
  response.content = JSON_SCHEMA_CONTENT(schema)
}

/**
 * Successful payloads travel inside the shared success envelope (see
 * `app/middleware/response_envelope_middleware.ts`), so the documented schema
 * has to describe the wrapper, not just the payload.
 */
const successEnvelopeOf = (dataSchema: unknown) => ({
  allOf: [
    { $ref: '#/components/schemas/SuccessEnvelope' },
    {
      type: 'object',
      required: ['data'],
      properties: { data: dataSchema },
    },
  ],
})

const readResponseSchema = (response: OpenApiResponse) => {
  const content = response.content as
    | Record<string, { schema?: unknown }>
    | undefined

  return content?.['application/json']?.schema
}

const patchContractResponses = (schema: OpenApiDocument) => {
  const taskListPath = Object.keys(schema.paths ?? {}).find((path) =>
    path.endsWith('/tasks')
  )
  const taskListOperation = taskListPath
    ? schema.paths?.[taskListPath]?.get
    : undefined
  const taskListOkResponse = taskListOperation?.responses?.['200']

  if (taskListOkResponse) {
    patchResponseSchema(taskListOkResponse, {
      $ref: '#/components/schemas/PaginatedTaskResponse',
    })
  }

  for (const pathItem of Object.values(schema.paths ?? {})) {
    for (const operation of Object.values(pathItem)) {
      for (const [statusCode, response] of Object.entries(
        operation.responses ?? {}
      )) {
        if (!SUCCESS_STATUS_CODES.has(statusCode)) {
          continue
        }

        const dataSchema = readResponseSchema(response)

        if (dataSchema !== undefined) {
          patchResponseSchema(response, successEnvelopeOf(dataSchema))
        }
      }
    }
  }

  for (const pathItem of Object.values(schema.paths ?? {})) {
    for (const operation of Object.values(pathItem)) {
      for (const [statusCode, response] of Object.entries(
        operation.responses ?? {}
      )) {
        if (ERROR_STATUS_CODES.has(statusCode)) {
          patchResponseSchema(response, ERROR_SCHEMA_REFERENCE)
        }
      }
    }
  }
}

export const generateOpenApiSchema = async (
  routes: unknown
): Promise<OpenApiDocument> => {
  const schema = (await AutoSwagger.json(routes, swagger)) as OpenApiDocument

  delete schema.components?.securitySchemes
  addContractSchemas(schema)
  patchContractResponses(schema)

  return schema
}

export const stringifyOpenApiSchema = (schema: OpenApiDocument) => {
  return AutoSwagger.jsonToYaml(schema) as string
}
