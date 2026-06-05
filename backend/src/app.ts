import Fastify from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { registerCors } from '@/config/cors.config';
import { errorHandler } from '@/config/error.config';
import { env } from '@/config/env';
import { registerJwt } from '@/config/jwt.config';
import {
  registerSwagger,
  serializerCompiler,
  validatorCompiler,
} from '@/config/swagger.config';
import { authRoutes } from '@/http/routes/auth.routes';
import { healthSchema } from '@/http/schemas/health.schema';

export async function buildApp() {
  const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(errorHandler);

  await registerCors(app);
  await registerJwt(app);

  if (env.ENABLE_SWAGGER) {
    await registerSwagger(app);

    app.get('/', { schema: { hide: true } }, async (_request, reply) => reply.redirect('/docs'));
  }

  await app.register(
    async (api) => {
      api.get('/health', { schema: healthSchema }, async () => ({ status: 'ok' }));
      
      await api.register(authRoutes);
    },
    { prefix: '/api/v1' }
  );

  return app;
}
