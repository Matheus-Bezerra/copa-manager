import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ListMembersParams } from '@/http/schemas/championship-members/list-members.schema';
import { PrismaChampionshipMemberRepository } from '@/prisma/repositories/prisma-championship-member-repository';
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service';
import { ListMembersUseCase } from '@/use-cases/championship-members/list-members';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function listMembersController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as ListMembersParams;

  try {
    await request.verifyUserAvailability();

    const listMembersUseCase = new ListMembersUseCase(
      prismaChampionshipService(),
      new PrismaChampionshipMemberRepository()
    );

    const { members } = await listMembersUseCase.execute({ championshipId });

    return reply.status(200).send({ data: { members } });
  } catch (err) {
    logger.error('List members error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
