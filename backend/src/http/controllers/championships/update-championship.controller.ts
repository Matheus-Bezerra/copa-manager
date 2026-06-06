import type { FastifyReply, FastifyRequest } from 'fastify';
import type {
  UpdateChampionshipBody,
  UpdateChampionshipParams,
} from '@/http/schemas/championships/update-championship.schema';
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository';
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service';
import { UpdateChampionshipUseCase } from '@/use-cases/championships/update-championship';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function updateChampionshipController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as UpdateChampionshipParams;
  const body = request.body as UpdateChampionshipBody;

  try {
    const { userId } = await request.verifyUserAvailability();

    const updateChampionshipUseCase = new UpdateChampionshipUseCase(
      prismaChampionshipService(),
      new PrismaChampionshipRepository()
    );

    const { championship } = await updateChampionshipUseCase.execute({
      userId,
      championshipId,
      ...body,
    });

    return reply.status(200).send({ data: { championship } });
  } catch (err) {
    logger.error('Update championship error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
