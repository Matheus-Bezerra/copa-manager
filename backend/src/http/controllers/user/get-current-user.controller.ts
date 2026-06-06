import type { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaUserRepository } from '@/prisma/repositories/prisma-user-repository';
import { GetCurrentUserUseCase } from '@/use-cases/user/get-current-user';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function getCurrentUserController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { userId } = await request.verifyUserAvailability();

    const getCurrentUserUseCase = new GetCurrentUserUseCase(new PrismaUserRepository());

    const user = await getCurrentUserUseCase.execute({ userId });

    return reply.status(200).send({ data: user });
  } catch (err) {
    logger.error('Get current user error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
