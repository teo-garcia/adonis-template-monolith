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
