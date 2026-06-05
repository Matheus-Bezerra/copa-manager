import type { FastifyInstance } from 'fastify';
import { loginController } from '@/http/controllers/auth/login.controller';
import { refreshController } from '@/http/controllers/auth/refresh.controller';
import { registerController } from '@/http/controllers/auth/register.controller';
import { loginSchema } from '@/http/schemas/auth/login.schema';
import { refreshSchema } from '@/http/schemas/auth/refresh.schema';
import { registerSchema } from '@/http/schemas/auth/register.schema';

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', { schema: registerSchema }, registerController);
  app.post('/auth/login', { schema: loginSchema }, loginController);
  app.post('/auth/refresh', { schema: refreshSchema }, refreshController);
}
