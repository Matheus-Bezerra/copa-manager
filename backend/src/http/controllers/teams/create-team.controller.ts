import type { FastifyReply, FastifyRequest } from 'fastify';
import type { CreateTeamBody, CreateTeamParams } from '@/http/schemas/teams/create-team.schema';
import { PrismaTeamRepository } from '@/prisma/repositories/prisma-team-repository';
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service';
import { CreateTeamUseCase } from '@/use-cases/teams/create-team';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function createTeamController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as CreateTeamParams;
  const body = request.body as CreateTeamBody;

  try {
    const { userId } = await request.verifyUserAvailability();

    const createTeamUseCase = new CreateTeamUseCase(
      prismaChampionshipService(),
      new PrismaTeamRepository()
    );

    const { team } = await createTeamUseCase.execute({
      userId,
      championshipId,
      ...body,
    });

    return reply.status(201).send({ data: { team } });
  } catch (err) {
    logger.error('Create team error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
