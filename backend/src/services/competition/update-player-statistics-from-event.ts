import type { MatchEventType } from '@/repositories/match-event-repository'
import type {
  PlayerStatisticsIncrement,
  PlayerStatisticsRepository,
} from '@/repositories/player-statistics-repository'

const EVENT_STAT_INCREMENT: Record<
  Exclude<MatchEventType, 'MVP'>,
  PlayerStatisticsIncrement
> = {
  GOAL: { goals: 1 },
  YELLOW_CARD: { yellowCards: 1 },
  RED_CARD: { redCards: 1 },
}

interface IncrementPlayerStatisticsFromEventOptions {
  countMatchPlayed?: boolean
}

export async function incrementPlayerStatisticsFromEvent(
  playerStatisticsRepository: PlayerStatisticsRepository,
  playerId: string,
  eventType: MatchEventType,
  options?: IncrementPlayerStatisticsFromEventOptions,
): Promise<void> {
  const matchesPlayedIncrement = options?.countMatchPlayed ? { matchesPlayed: 1 } : {}

  if (eventType === 'MVP') {
    await playerStatisticsRepository.increment(playerId, {
      matchMvps: 1,
      ...matchesPlayedIncrement,
    })
    return
  }

  await playerStatisticsRepository.increment(playerId, {
    ...EVENT_STAT_INCREMENT[eventType],
    ...matchesPlayedIncrement,
  })
}

export async function decrementPlayerStatisticsFromEvent(
  playerStatisticsRepository: PlayerStatisticsRepository,
  playerId: string,
  eventType: MatchEventType,
): Promise<void> {
  if (eventType === 'MVP') {
    await playerStatisticsRepository.increment(playerId, { matchMvps: -1 })
    return
  }

  const increment = EVENT_STAT_INCREMENT[eventType as Exclude<MatchEventType, 'MVP'>]

  await playerStatisticsRepository.increment(playerId, {
    goals: increment.goals !== undefined ? -increment.goals : undefined,
    yellowCards: increment.yellowCards !== undefined ? -increment.yellowCards : undefined,
    redCards: increment.redCards !== undefined ? -increment.redCards : undefined,
  })
}
