import type { FastifyReply, FastifyRequest } from 'fastify';
import type { LogoutBody } from '@/http/schemas/auth/logout.schema';
import { PrismaRefreshTokenRepository } from '@/prisma/repositories/prisma-refresh-token-repository';
import { LogoutUseCase } from '@/use-cases/auth/logout';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function logoutController(request: FastifyRequest, reply: FastifyReply) {
  const { refreshToken } = request.body as LogoutBody;

  try {
    const logoutUseCase = new LogoutUseCase(new PrismaRefreshTokenRepository());

    await logoutUseCase.execute({ refreshToken });

    return reply.status(204).send();
  } catch (err) {
    logger.error('Logout error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
