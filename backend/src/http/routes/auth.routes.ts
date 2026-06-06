import type { FastifyInstance } from 'fastify';
import { changePasswordController } from '@/http/controllers/auth/change-password.controller';
import { forgotPasswordController } from '@/http/controllers/auth/forgot-password.controller';
import { loginController } from '@/http/controllers/auth/login.controller';
import { logoutController } from '@/http/controllers/auth/logout.controller';
import { refreshController } from '@/http/controllers/auth/refresh.controller';
import { registerController } from '@/http/controllers/auth/register.controller';
import { resetPasswordController } from '@/http/controllers/auth/reset-password.controller';
import { auth } from '@/http/middlewares/auth.middleware';
import { changePasswordSchema } from '@/http/schemas/auth/change-password.schema';
import { forgotPasswordSchema } from '@/http/schemas/auth/forgot-password.schema';
import { loginSchema } from '@/http/schemas/auth/login.schema';
import { logoutSchema } from '@/http/schemas/auth/logout.schema';
import { refreshSchema } from '@/http/schemas/auth/refresh.schema';
import { registerSchema } from '@/http/schemas/auth/register.schema';
import { resetPasswordSchema } from '@/http/schemas/auth/reset-password.schema';

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', { schema: registerSchema }, registerController);
  app.post('/auth/login', { schema: loginSchema }, loginController);
  app.post('/auth/refresh', { schema: refreshSchema }, refreshController);
  app.post('/auth/logout', { schema: logoutSchema }, logoutController);
  app.post('/auth/forgot-password', { schema: forgotPasswordSchema }, forgotPasswordController);
  app.post('/auth/reset-password', { schema: resetPasswordSchema }, resetPasswordController);

  await app.register(async (protectedAuthRoutes) => {
    await protectedAuthRoutes.register(auth);

    protectedAuthRoutes.post(
      '/auth/change-password',
      { schema: changePasswordSchema },
      changePasswordController
    );
  });
}
