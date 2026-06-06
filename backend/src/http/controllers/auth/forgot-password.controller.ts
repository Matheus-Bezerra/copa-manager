import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ForgotPasswordBody } from '@/http/schemas/auth/forgot-password.schema';
import { PrismaPasswordResetTokenRepository } from '@/prisma/repositories/prisma-password-reset-token-repository';
import { PrismaUserRepository } from '@/prisma/repositories/prisma-user-repository';
import { ResendEmailService } from '@/services/email/resend-email-service';
import { ForgotPasswordUseCase } from '@/use-cases/auth/forgot-password';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function forgotPasswordController(request: FastifyRequest, reply: FastifyReply) {
  const { email } = request.body as ForgotPasswordBody;

  try {
    const forgotPasswordUseCase = new ForgotPasswordUseCase(
      new PrismaUserRepository(),
      new PrismaPasswordResetTokenRepository(),
      new ResendEmailService()
    );

    await forgotPasswordUseCase.execute({ email });

    return reply.status(204).send();
  } catch (err) {
    logger.error('Forgot password error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
