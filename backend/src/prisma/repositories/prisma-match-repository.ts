import { prisma } from '@/lib/prisma'
import type {
  CreateMatchInput,
  ListMatchesFilters,
  Match,
  MatchRepository,
  UpdateMatchInput,
} from '@/repositories/match-repository'

export class PrismaMatchRepository implements MatchRepository {
  async findById(id: string): Promise<Match | null> {
    return prisma.match.findUnique({ where: { id } })
  }

  async findByChampionshipId(championshipId: string, filters?: ListMatchesFilters): Promise<Match[]> {
    return prisma.match.findMany({
      where: {
        championshipId,
        ...(filters?.roundId ? { roundId: filters.roundId } : {}),
        ...(filters?.groupId ? { groupId: filters.groupId } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
      },
      orderBy: { scheduledAt: 'asc' },
    })
  }

  async findByRoundId(roundId: string): Promise<Match[]> {
    return prisma.match.findMany({
      where: { roundId },
      orderBy: { scheduledAt: 'asc' },
    })
  }

  async create(data: CreateMatchInput): Promise<Match> {
    return prisma.match.create({ data })
  }

  async update(id: string, data: UpdateMatchInput): Promise<Match> {
    return prisma.match.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.match.delete({ where: { id } })
  }
}
