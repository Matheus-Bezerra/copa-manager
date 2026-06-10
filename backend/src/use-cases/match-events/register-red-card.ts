import type { MatchEventRepository } from '@/repositories/match-event-repository'
import type { MatchRepository } from '@/repositories/match-repository'
import type { PlayerRepository } from '@/repositories/player-repository'
import type { PlayerStatisticsRepository } from '@/repositories/player-statistics-repository'
import { registerScoringEvent } from '@/use-cases/match-events/register-scoring-event'

export interface RegisterRedCardUseCaseRequest {
  championshipId: string
  matchId: string
  playerId: string
  minute?: number | null
}

export class RegisterRedCardUseCase {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly matchEventRepository: MatchEventRepository,
    private readonly playerStatisticsRepository: PlayerStatisticsRepository,
  ) {}

  async execute(request: RegisterRedCardUseCaseRequest) {
    return registerScoringEvent(
      { ...request, eventType: 'RED_CARD' },
      this.matchRepository,
      this.playerRepository,
      this.matchEventRepository,
      this.playerStatisticsRepository,
    )
  }
}
