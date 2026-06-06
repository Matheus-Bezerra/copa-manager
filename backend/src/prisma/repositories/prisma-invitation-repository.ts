import { prisma } from '@/lib/prisma';
import type {
  CreateInvitationInput,
  Invitation,
  InvitationRepository,
} from '@/repositories/invitation-repository';

export class PrismaInvitationRepository implements InvitationRepository {
  async findPendingByChampionshipAndEmail(
    championshipId: string,
    email: string
  ): Promise<Invitation | null> {
    return prisma.invitation.findFirst({
      where: {
        championshipId,
        email,
        status: 'PENDING',
      },
    });
  }

  async create(data: CreateInvitationInput): Promise<Invitation> {
    return prisma.invitation.create({ data });
  }
}
