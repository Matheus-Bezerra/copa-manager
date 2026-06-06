import type { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository';
import { ListChampionshipsUseCase } from '@/use-cases/championships/list-championships';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function listChampionshipsController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { userId } = await request.verifyUserAvailability();

    const listChampionshipsUseCase = new ListChampionshipsUseCase(new PrismaChampionshipRepository());

    const { championships } = await listChampionshipsUseCase.execute({ userId });

    return reply.status(200).send({ data: { championships } });
  } catch (err) {
    logger.error('List championships error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
