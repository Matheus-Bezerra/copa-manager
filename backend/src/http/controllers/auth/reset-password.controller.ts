import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ResetPasswordBody } from '@/http/schemas/auth/reset-password.schema';
import { PrismaPasswordResetTokenRepository } from '@/prisma/repositories/prisma-password-reset-token-repository';
import { PrismaRefreshTokenRepository } from '@/prisma/repositories/prisma-refresh-token-repository';
import { PrismaUserRepository } from '@/prisma/repositories/prisma-user-repository';
import { ResetPasswordUseCase } from '@/use-cases/auth/reset-password';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function resetPasswordController(request: FastifyRequest, reply: FastifyReply) {
  const { code, newPassword } = request.body as ResetPasswordBody;

  try {
    const resetPasswordUseCase = new ResetPasswordUseCase(
      new PrismaPasswordResetTokenRepository(),
      new PrismaUserRepository(),
      new PrismaRefreshTokenRepository()
    );

    await resetPasswordUseCase.execute({ code, newPassword });

    return reply.status(204).send();
  } catch (err) {
    logger.error('Reset password error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
