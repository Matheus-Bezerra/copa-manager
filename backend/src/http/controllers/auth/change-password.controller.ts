import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ChangePasswordBody } from '@/http/schemas/auth/change-password.schema';
import { PrismaRefreshTokenRepository } from '@/prisma/repositories/prisma-refresh-token-repository';
import { PrismaUserRepository } from '@/prisma/repositories/prisma-user-repository';
import { ChangePasswordUseCase } from '@/use-cases/auth/change-password';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function changePasswordController(request: FastifyRequest, reply: FastifyReply) {
  const { currentPassword, newPassword } = request.body as ChangePasswordBody;

  try {
    const { userId } = await request.verifyUserAvailability();

    const changePasswordUseCase = new ChangePasswordUseCase(
      new PrismaUserRepository(),
      new PrismaRefreshTokenRepository()
    );

    await changePasswordUseCase.execute({ userId, currentPassword, newPassword });

    return reply.status(204).send();
  } catch (err) {
    logger.error('Change password error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
