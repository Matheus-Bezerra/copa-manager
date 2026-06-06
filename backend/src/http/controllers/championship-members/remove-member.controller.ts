import type { FastifyReply, FastifyRequest } from 'fastify';
import type { RemoveMemberParams } from '@/http/schemas/championship-members/remove-member.schema';
import { PrismaChampionshipMemberRepository } from '@/prisma/repositories/prisma-championship-member-repository';
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service';
import { RemoveMemberUseCase } from '@/use-cases/championship-members/remove-member';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function removeMemberController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, memberId } = request.params as RemoveMemberParams;

  try {
    const { userId } = await request.verifyUserAvailability();

    const removeMemberUseCase = new RemoveMemberUseCase(
      prismaChampionshipService(),
      new PrismaChampionshipMemberRepository()
    );

    await removeMemberUseCase.execute({ userId, championshipId, memberId });

    return reply.status(204).send();
  } catch (err) {
    logger.error('Remove member error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
