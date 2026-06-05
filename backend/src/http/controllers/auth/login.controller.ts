import type { FastifyReply, FastifyRequest } from 'fastify';

import type { LoginBody } from '@/http/schemas/auth/login.schema';
import { PrismaRefreshTokenRepository } from '@/prisma/repositories/prisma-refresh-token-repository';
import { PrismaUserRepository } from '@/prisma/repositories/prisma-user-repository';
import { LoginUseCase } from '@/use-cases/auth/login';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function loginController(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = request.body as LoginBody;

  try {
    const loginUseCase = new LoginUseCase(
      new PrismaUserRepository(),
      new PrismaRefreshTokenRepository()
    );

    const result = await loginUseCase.execute({ email, password });

    return reply.status(200).send({ data: result });
  } catch (err) {
    logger.error('Login error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
