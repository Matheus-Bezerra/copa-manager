import type { FastifyReply, FastifyRequest } from 'fastify';

import type { RegisterBody } from '@/http/schemas/auth/register.schema';
import { PrismaRefreshTokenRepository } from '@/prisma/repositories/prisma-refresh-token-repository';
import { PrismaUserRepository } from '@/prisma/repositories/prisma-user-repository';
import { RegisterUseCase } from '@/use-cases/auth/register';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function registerController(request: FastifyRequest, reply: FastifyReply) {
  const { name, email, password } = request.body as RegisterBody;

  try {
    const registerUseCase = new RegisterUseCase(
      new PrismaUserRepository(),
      new PrismaRefreshTokenRepository()
    );

    const result = await registerUseCase.execute({ name, email, password });

    return reply.status(201).send({ data: result });
  } catch (err) {
    logger.error('Register error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
