import AutoSwaggerModule from 'adonis-autoswagger'

import swagger from '#config/swagger'

const AutoSwagger = AutoSwaggerModule.default

type OpenApiComponents = {
  securitySchemes?: Record<string, unknown>
  [key: string]: unknown
}

type OpenApiDocument = {
  components?: OpenApiComponents
  [key: string]: unknown
}

export const generateOpenApiSchema = async (
  routes: unknown
): Promise<OpenApiDocument> => {
  const schema = (await AutoSwagger.json(routes, swagger)) as OpenApiDocument

  delete schema.components?.securitySchemes

  return schema
}

export const stringifyOpenApiSchema = (schema: OpenApiDocument) => {
  return AutoSwagger.jsonToYaml(schema) as string
}
