import type { FastifyReply, FastifyRequest } from 'fastify';
import type { UpdateTeamBody, UpdateTeamParams } from '@/http/schemas/teams/update-team.schema';
import { PrismaTeamRepository } from '@/prisma/repositories/prisma-team-repository';
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service';
import { UpdateTeamUseCase } from '@/use-cases/teams/update-team';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function updateTeamController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, teamId } = request.params as UpdateTeamParams;
  const body = request.body as UpdateTeamBody;

  try {
    const { userId } = await request.verifyUserAvailability();

    const updateTeamUseCase = new UpdateTeamUseCase(
      prismaChampionshipService(),
      new PrismaTeamRepository()
    );

    const { team } = await updateTeamUseCase.execute({
      userId,
      championshipId,
      teamId,
      ...body,
    });

    return reply.status(200).send({ data: { team } });
  } catch (err) {
    logger.error('Update team error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
