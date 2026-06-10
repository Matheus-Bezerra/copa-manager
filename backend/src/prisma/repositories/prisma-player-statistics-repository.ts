import { ulid } from 'ulidx'
import { prisma } from '@/lib/prisma'
import type {
  PlayerStatistics,
  PlayerStatisticsIncrement,
  PlayerStatisticsRepository,
} from '@/repositories/player-statistics-repository'

function buildIncrementData(fields: PlayerStatisticsIncrement) {
  return {
    ...(fields.goals !== undefined ? { goals: { increment: fields.goals } } : {}),
    ...(fields.assists !== undefined ? { assists: { increment: fields.assists } } : {}),
    ...(fields.yellowCards !== undefined ? { yellowCards: { increment: fields.yellowCards } } : {}),
    ...(fields.redCards !== undefined ? { redCards: { increment: fields.redCards } } : {}),
    ...(fields.matchMvps !== undefined ? { matchMvps: { increment: fields.matchMvps } } : {}),
    ...(fields.matchesPlayed !== undefined
      ? { matchesPlayed: { increment: fields.matchesPlayed } }
      : {}),
  }
}

export class PrismaPlayerStatisticsRepository implements PlayerStatisticsRepository {
  async findByPlayerId(playerId: string): Promise<PlayerStatistics | null> {
    return prisma.playerStatistics.findUnique({ where: { playerId } })
  }

  async increment(playerId: string, fields: PlayerStatisticsIncrement): Promise<PlayerStatistics> {
    const existing = await prisma.playerStatistics.findUnique({ where: { playerId } })

    if (!existing) {
      return prisma.playerStatistics.create({
        data: {
          id: ulid(),
          playerId,
          goals: fields.goals ?? 0,
          assists: fields.assists ?? 0,
          yellowCards: fields.yellowCards ?? 0,
          redCards: fields.redCards ?? 0,
          matchMvps: fields.matchMvps ?? 0,
          matchesPlayed: fields.matchesPlayed ?? 0,
        },
      })
    }

    return prisma.playerStatistics.update({
      where: { playerId },
      data: buildIncrementData(fields),
    })
  }
}
