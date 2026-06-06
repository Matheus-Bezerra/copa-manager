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
import { championshipMemberRoutes } from '@/http/routes/championship-member.routes';
import { championshipRoutes } from '@/http/routes/championship.routes';
import { playerRoutes } from '@/http/routes/player.routes';
import { publicRoutes } from '@/http/routes/public.routes';
import { teamRoutes } from '@/http/routes/team.routes';
import { userRoutes } from '@/http/routes/user.routes';
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
      await api.register(userRoutes);
      await api.register(championshipRoutes);
      await api.register(championshipMemberRoutes);
      await api.register(teamRoutes);
      await api.register(playerRoutes);
      await api.register(publicRoutes);
    },
    { prefix: '/api/v1' }
  );

  return app;
}
