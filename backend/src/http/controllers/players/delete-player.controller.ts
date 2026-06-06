import type { FastifyReply, FastifyRequest } from 'fastify';
import type { DeletePlayerParams } from '@/http/schemas/players/delete-player.schema';
import { PrismaPlayerRepository } from '@/prisma/repositories/prisma-player-repository';
import { PrismaTeamRepository } from '@/prisma/repositories/prisma-team-repository';
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service';
import { DeletePlayerUseCase } from '@/use-cases/players/delete-player';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function deletePlayerController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, playerId } = request.params as DeletePlayerParams;

  try {
    const { userId } = await request.verifyUserAvailability();

    const deletePlayerUseCase = new DeletePlayerUseCase(
      prismaChampionshipService(),
      new PrismaTeamRepository(),
      new PrismaPlayerRepository()
    );

    await deletePlayerUseCase.execute({ userId, championshipId, playerId });

    return reply.status(204).send();
  } catch (err) {
    logger.error('Delete player error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
