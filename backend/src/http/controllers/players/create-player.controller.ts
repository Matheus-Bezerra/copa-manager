import type { FastifyReply, FastifyRequest } from 'fastify';
import type {
  CreatePlayerBody,
  CreatePlayerParams,
} from '@/http/schemas/players/create-player.schema';
import { PrismaPlayerRepository } from '@/prisma/repositories/prisma-player-repository';
import { PrismaTeamRepository } from '@/prisma/repositories/prisma-team-repository';
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service';
import { CreatePlayerUseCase } from '@/use-cases/players/create-player';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function createPlayerController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as CreatePlayerParams;
  const { teamId, name, shirtNumber, statistics } = request.body as CreatePlayerBody;

  try {
    const { userId } = await request.verifyUserAvailability();

    const createPlayerUseCase = new CreatePlayerUseCase(
      prismaChampionshipService(),
      new PrismaTeamRepository(),
      new PrismaPlayerRepository()
    );

    const { player } = await createPlayerUseCase.execute({
      userId,
      championshipId,
      teamId,
      name,
      shirtNumber,
      statistics,
    });

    return reply.status(201).send({ data: { player } });
  } catch (err) {
    logger.error('Create player error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
