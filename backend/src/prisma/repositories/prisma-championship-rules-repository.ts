import { prisma } from '@/lib/prisma'
import type {
  ChampionshipRules,
  ChampionshipRulesRepository,
  UpsertChampionshipRulesInput,
} from '@/repositories/championship-rules-repository'

export class PrismaChampionshipRulesRepository implements ChampionshipRulesRepository {
  async findByChampionshipId(championshipId: string): Promise<ChampionshipRules | null> {
    return prisma.championshipRules.findUnique({ where: { championshipId } })
  }

  async upsert(data: UpsertChampionshipRulesInput): Promise<ChampionshipRules> {
    return prisma.championshipRules.upsert({
      where: { championshipId: data.championshipId },
      create: {
        id: data.id,
        championshipId: data.championshipId,
        winPoints: data.winPoints ?? 3,
        drawPoints: data.drawPoints ?? 1,
        penaltyBonusPoints: data.penaltyBonusPoints ?? 0,
        yellowCardsForSuspension: data.yellowCardsForSuspension ?? 3,
        redCardSuspensionGames: data.redCardSuspensionGames ?? 1,
        matchDuration: data.matchDuration ?? 90,
      },
      update: {
        winPoints: data.winPoints,
        drawPoints: data.drawPoints,
        penaltyBonusPoints: data.penaltyBonusPoints,
        yellowCardsForSuspension: data.yellowCardsForSuspension,
        redCardSuspensionGames: data.redCardSuspensionGames,
        matchDuration: data.matchDuration,
      },
    })
  }
}
