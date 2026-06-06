import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ListPlayersParams } from '@/http/schemas/players/list-players.schema';
import { PrismaPlayerRepository } from '@/prisma/repositories/prisma-player-repository';
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service';
import { ListPlayersUseCase } from '@/use-cases/players/list-players';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function listPlayersController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as ListPlayersParams;

  try {
    await request.verifyUserAvailability();

    const listPlayersUseCase = new ListPlayersUseCase(
      prismaChampionshipService(),
      new PrismaPlayerRepository()
    );

    const { players } = await listPlayersUseCase.execute({ championshipId });

    return reply.status(200).send({ data: { players } });
  } catch (err) {
    logger.error('List players error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
