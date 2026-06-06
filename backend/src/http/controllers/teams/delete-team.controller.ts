import type { FastifyReply, FastifyRequest } from 'fastify';
import type { DeleteTeamParams } from '@/http/schemas/teams/delete-team.schema';
import { PrismaTeamRepository } from '@/prisma/repositories/prisma-team-repository';
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service';
import { DeleteTeamUseCase } from '@/use-cases/teams/delete-team';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function deleteTeamController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, teamId } = request.params as DeleteTeamParams;

  try {
    const { userId } = await request.verifyUserAvailability();

    const deleteTeamUseCase = new DeleteTeamUseCase(
      prismaChampionshipService(),
      new PrismaTeamRepository()
    );

    await deleteTeamUseCase.execute({ userId, championshipId, teamId });

    return reply.status(204).send();
  } catch (err) {
    logger.error('Delete team error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
