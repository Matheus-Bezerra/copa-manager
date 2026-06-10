import { prisma } from '@/lib/prisma'
import type {
  CreateMatchInput,
  ListMatchesFilters,
  Match,
  MatchRepository,
  MatchWithResult,
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
      orderBy: { createdAt: 'asc' },
    })
  }

  async findByStageId(stageId: string): Promise<Match[]> {
    return prisma.match.findMany({
      where: { round: { stageId } },
      orderBy: [{ round: { number: 'asc' } }, { createdAt: 'asc' }],
    })
  }

  async findFinishedWithResultsByGroupId(groupId: string): Promise<MatchWithResult[]> {
    const matches = await prisma.match.findMany({
      where: { groupId, status: 'FINISHED', result: { isNot: null } },
      include: { result: true },
    })

    return matches
      .filter((match) => match.result !== null)
      .map((match) => ({
        id: match.id,
        championshipId: match.championshipId,
        roundId: match.roundId,
        groupId: match.groupId,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        scheduledAt: match.scheduledAt,
        status: match.status,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt,
        result: {
          homeScore: match.result!.homeScore,
          awayScore: match.result!.awayScore,
          homePenaltyScore: match.result!.homePenaltyScore,
          awayPenaltyScore: match.result!.awayPenaltyScore,
        },
      }))
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
