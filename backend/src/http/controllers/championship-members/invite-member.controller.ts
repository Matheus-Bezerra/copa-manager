import type { FastifyReply, FastifyRequest } from 'fastify';
import type {
  InviteMemberBody,
  InviteMemberParams,
} from '@/http/schemas/championship-members/invite-member.schema';
import { PrismaChampionshipMemberRepository } from '@/prisma/repositories/prisma-championship-member-repository';
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository';
import { PrismaInvitationRepository } from '@/prisma/repositories/prisma-invitation-repository';
import { PrismaUserRepository } from '@/prisma/repositories/prisma-user-repository';
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service';
import { ResendEmailService } from '@/services/email/resend-email-service';
import { InviteMemberUseCase } from '@/use-cases/championship-members/invite-member';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function inviteMemberController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as InviteMemberParams;
  const { email, role } = request.body as InviteMemberBody;

  try {
    const { userId } = await request.verifyUserAvailability();

    const inviteMemberUseCase = new InviteMemberUseCase(
      prismaChampionshipService(),
      new PrismaChampionshipRepository(),
      new PrismaChampionshipMemberRepository(),
      new PrismaInvitationRepository(),
      new PrismaUserRepository(),
      new ResendEmailService()
    );

    const { invitation, emailSent } = await inviteMemberUseCase.execute({
      userId,
      championshipId,
      email,
      role,
    });

    return reply.status(201).send({ data: { invitation, emailSent } });
  } catch (err) {
    logger.error('Invite member error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
