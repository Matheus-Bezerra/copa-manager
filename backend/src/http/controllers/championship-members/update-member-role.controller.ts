import type { FastifyReply, FastifyRequest } from 'fastify';
import type {
  UpdateMemberRoleBody,
  UpdateMemberRoleParams,
} from '@/http/schemas/championship-members/update-member-role.schema';
import { PrismaChampionshipMemberRepository } from '@/prisma/repositories/prisma-championship-member-repository';
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service';
import { UpdateMemberRoleUseCase } from '@/use-cases/championship-members/update-member-role';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function updateMemberRoleController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, memberId } = request.params as UpdateMemberRoleParams;
  const { role } = request.body as UpdateMemberRoleBody;

  try {
    const { userId } = await request.verifyUserAvailability();

    const updateMemberRoleUseCase = new UpdateMemberRoleUseCase(
      prismaChampionshipService(),
      new PrismaChampionshipMemberRepository()
    );

    const { member } = await updateMemberRoleUseCase.execute({
      userId,
      championshipId,
      memberId,
      role,
    });

    return reply.status(200).send({ data: { member } });
  } catch (err) {
    logger.error('Update member role error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
