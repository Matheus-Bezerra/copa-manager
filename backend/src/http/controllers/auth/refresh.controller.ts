import type { FastifyReply, FastifyRequest } from 'fastify';

import type { RefreshBody } from '@/http/schemas/auth/refresh.schema';
import { PrismaRefreshTokenRepository } from '@/prisma/repositories/prisma-refresh-token-repository';
import { RefreshSessionUseCase } from '@/use-cases/auth/refresh-session';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function refreshController(request: FastifyRequest, reply: FastifyReply) {
  const { refreshToken } = request.body as RefreshBody;

  try {
    const refreshSessionUseCase = new RefreshSessionUseCase(new PrismaRefreshTokenRepository());

    const result = await refreshSessionUseCase.execute({ refreshToken });

    return reply.status(200).send({ data: result });
  } catch (err) {
    logger.error('Refresh session error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
