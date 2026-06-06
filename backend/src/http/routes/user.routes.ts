import type { FastifyInstance } from 'fastify';
import { auth } from '@/http/middlewares/auth.middleware';
import { getCurrentUserController } from '@/http/controllers/user/get-current-user.controller';
import { getCurrentUserSchema } from '@/http/schemas/user/get-current-user.schema';

export async function userRoutes(app: FastifyInstance) {
  await app.register(auth);

  app.get('/me', { schema: getCurrentUserSchema }, getCurrentUserController);
}
