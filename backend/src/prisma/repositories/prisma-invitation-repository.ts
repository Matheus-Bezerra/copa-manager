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

  async findByToken(token: string): Promise<Invitation | null> {
    return prisma.invitation.findUnique({
      where: { token },
    });
  }

  async create(data: CreateInvitationInput): Promise<Invitation> {
    return prisma.invitation.create({ data });
  }

  async markAsExpired(id: string): Promise<Invitation> {
    return prisma.invitation.update({
      where: { id },
      data: { status: 'EXPIRED' },
    });
  }

  async acceptInvitation(id: string): Promise<Invitation> {
    return prisma.invitation.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });
  }
}
