import type { FastifyReply, FastifyRequest } from 'fastify';
import type { GetChampionshipParams } from '@/http/schemas/championships/get-championship.schema';
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service';
import { GetChampionshipUseCase } from '@/use-cases/championships/get-championship';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function getChampionshipController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as GetChampionshipParams;

  try {
    await request.verifyUserAvailability();

    const getChampionshipUseCase = new GetChampionshipUseCase(prismaChampionshipService());

    const { championship } = await getChampionshipUseCase.execute({ championshipId });

    return reply.status(200).send({ data: { championship } });
  } catch (err) {
    logger.error('Get championship error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
