import { prisma } from '@/lib/prisma'
import type {
  MatchResult,
  MatchResultRepository,
  UpsertMatchResultInput,
} from '@/repositories/match-result-repository'

export class PrismaMatchResultRepository implements MatchResultRepository {
  async findByMatchId(matchId: string): Promise<MatchResult | null> {
    return prisma.matchResult.findUnique({ where: { matchId } })
  }

  async findByMatchIds(matchIds: string[]): Promise<MatchResult[]> {
    if (matchIds.length === 0) {
      return []
    }

    return prisma.matchResult.findMany({
      where: { matchId: { in: matchIds } },
    })
  }

  async upsert(data: UpsertMatchResultInput): Promise<MatchResult> {
    return prisma.matchResult.upsert({
      where: { matchId: data.matchId },
      create: {
        id: data.id,
        matchId: data.matchId,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        homePenaltyScore: data.homePenaltyScore ?? null,
        awayPenaltyScore: data.awayPenaltyScore ?? null,
      },
      update: {
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        homePenaltyScore: data.homePenaltyScore ?? null,
        awayPenaltyScore: data.awayPenaltyScore ?? null,
      },
    })
  }

  async deleteByMatchId(matchId: string): Promise<void> {
    await prisma.matchResult.deleteMany({ where: { matchId } })
  }
}
