import type { FastifyReply, FastifyRequest } from 'fastify';
import type { DeleteChampionshipParams } from '@/http/schemas/championships/delete-championship.schema';
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository';
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service';
import { DeleteChampionshipUseCase } from '@/use-cases/championships/delete-championship';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function deleteChampionshipController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as DeleteChampionshipParams;

  try {
    const { userId } = await request.verifyUserAvailability();

    const deleteChampionshipUseCase = new DeleteChampionshipUseCase(
      prismaChampionshipService(),
      new PrismaChampionshipRepository()
    );

    await deleteChampionshipUseCase.execute({ userId, championshipId });

    return reply.status(204).send();
  } catch (err) {
    logger.error('Delete championship error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
