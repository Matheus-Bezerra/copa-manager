import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AcceptInvitationBody } from '@/http/schemas/championship-members/accept-invitation.schema';
import { PrismaChampionshipMemberRepository } from '@/prisma/repositories/prisma-championship-member-repository';
import { PrismaInvitationRepository } from '@/prisma/repositories/prisma-invitation-repository';
import { PrismaUserRepository } from '@/prisma/repositories/prisma-user-repository';
import { AcceptInvitationUseCase } from '@/use-cases/championship-members/accept-invitation';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function acceptInvitationController(request: FastifyRequest, reply: FastifyReply) {
  const { token } = request.body as AcceptInvitationBody;

  try {
    const { userId } = await request.verifyUserAvailability();

    const acceptInvitationUseCase = new AcceptInvitationUseCase(
      new PrismaInvitationRepository(),
      new PrismaChampionshipMemberRepository(),
      new PrismaUserRepository()
    );

    const { member } = await acceptInvitationUseCase.execute({ userId, token });

    return reply.status(200).send({ data: { member } });
  } catch (err) {
    logger.error('Accept invitation error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
