import type { FastifyReply, FastifyRequest } from 'fastify';
import type {
  UpdatePlayerBody,
  UpdatePlayerParams,
} from '@/http/schemas/players/update-player.schema';
import { PrismaPlayerRepository } from '@/prisma/repositories/prisma-player-repository';
import { PrismaTeamRepository } from '@/prisma/repositories/prisma-team-repository';
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service';
import { UpdatePlayerUseCase } from '@/use-cases/players/update-player';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function updatePlayerController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, playerId } = request.params as UpdatePlayerParams;
  const body = request.body as UpdatePlayerBody;

  try {
    const { userId } = await request.verifyUserAvailability();

    const updatePlayerUseCase = new UpdatePlayerUseCase(
      prismaChampionshipService(),
      new PrismaTeamRepository(),
      new PrismaPlayerRepository()
    );

    const { player } = await updatePlayerUseCase.execute({
      userId,
      championshipId,
      playerId,
      ...body,
    });

    return reply.status(200).send({ data: { player } });
  } catch (err) {
    logger.error('Update player error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
