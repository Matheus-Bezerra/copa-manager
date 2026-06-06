import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ListTeamsParams } from '@/http/schemas/teams/list-teams.schema';
import { PrismaTeamRepository } from '@/prisma/repositories/prisma-team-repository';
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service';
import { ListTeamsUseCase } from '@/use-cases/teams/list-teams';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function listTeamsController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as ListTeamsParams;

  try {
    await request.verifyUserAvailability();

    const listTeamsUseCase = new ListTeamsUseCase(
      prismaChampionshipService(),
      new PrismaTeamRepository()
    );

    const { teams } = await listTeamsUseCase.execute({ championshipId });

    return reply.status(200).send({ data: { teams } });
  } catch (err) {
    logger.error('List teams error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
