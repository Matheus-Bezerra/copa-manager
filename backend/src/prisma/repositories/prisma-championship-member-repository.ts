import type { ChampionshipRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type {
  ChampionshipMember,
  ChampionshipMemberRepository,
  ChampionshipMemberWithUser,
  CreateChampionshipMemberInput,
} from '@/repositories/championship-member-repository';

export class PrismaChampionshipMemberRepository implements ChampionshipMemberRepository {
  async findById(id: string): Promise<ChampionshipMember | null> {
    return prisma.championshipMember.findUnique({ where: { id } });
  }

  async findByChampionshipAndUser(
    championshipId: string,
    userId: string
  ): Promise<ChampionshipMember | null> {
    return prisma.championshipMember.findUnique({
      where: {
        championshipId_userId: {
          championshipId,
          userId,
        },
      },
    });
  }

  async findByChampionshipId(championshipId: string): Promise<ChampionshipMemberWithUser[]> {
    return prisma.championshipMember.findMany({
      where: { championshipId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: CreateChampionshipMemberInput): Promise<ChampionshipMember> {
    return prisma.championshipMember.create({ data });
  }

  async updateRole(id: string, role: ChampionshipRole): Promise<ChampionshipMember> {
    return prisma.championshipMember.update({
      where: { id },
      data: { role },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.championshipMember.delete({ where: { id } });
  }
}
