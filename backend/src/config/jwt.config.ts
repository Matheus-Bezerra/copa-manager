import jwt from '@fastify/jwt';
import type { FastifyInstance } from 'fastify';
import { errorMessage } from '@/constants/error-message';
import { env } from './env';

export async function registerJwt(app: FastifyInstance) {
  await app.register(jwt, { secret: env.JWT_SECRET });

  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(errorMessage.unauthorized.statusCode).send({
        code: errorMessage.unauthorized.code,
        message: errorMessage.unauthorized.message,
      });
    }
  });
}
