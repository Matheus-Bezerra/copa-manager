import { prisma } from '@/lib/prisma';
import type {
  CreateTeamInput,
  Team,
  TeamRepository,
  UpdateTeamInput,
} from '@/repositories/team-repository';

export class PrismaTeamRepository implements TeamRepository {
  async findById(id: string): Promise<Team | null> {
    return prisma.team.findUnique({ where: { id } });
  }

  async findByChampionshipId(championshipId: string): Promise<Team[]> {
    return prisma.team.findMany({
      where: { championshipId },
      orderBy: { name: 'asc' },
    });
  }

  async findByChampionshipIdAndName(championshipId: string, name: string): Promise<Team | null> {
    return prisma.team.findFirst({
      where: {
        championshipId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });
  }

  async create(data: CreateTeamInput): Promise<Team> {
    return prisma.team.create({ data });
  }

  async update(id: string, data: UpdateTeamInput): Promise<Team> {
    return prisma.team.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.team.delete({ where: { id } });
  }
}
