import swagger from '@fastify/swagger';
import scalar from '@scalar/fastify-api-reference';
import type { FastifyInstance } from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

export async function registerSwagger(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'Copa Manager API',
        description: 'API REST do Copa Manager',
        version: '1.0.0',
      },
      servers: [{ url: '/api/v1' }],
      tags: [
        { name: 'Health', description: 'Disponibilidade da API' },
        { name: 'Auth', description: 'Autenticação e sessão' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  await app.register(scalar, {
    routePrefix: '/docs',
    configuration: {
      title: 'Copa Manager API',
      layout: 'modern',
      theme: 'purple',
    },
  });
}

export { serializerCompiler, validatorCompiler };
