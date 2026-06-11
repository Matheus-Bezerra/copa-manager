import type { MatchEventRepository } from '@/repositories/match-event-repository'
import type { MatchRepository } from '@/repositories/match-repository'
import type { PlayerRepository } from '@/repositories/player-repository'
import type { PlayerStatisticsRepository } from '@/repositories/player-statistics-repository'
import { registerScoringEvent } from '@/use-cases/match-events/register-scoring-event'

export interface RegisterGoalUseCaseRequest {
  championshipId: string
  matchId: string
  playerId?: string | null
  teamId?: string | null
  minute?: number | null
}

export class RegisterGoalUseCase {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly matchEventRepository: MatchEventRepository,
    private readonly playerStatisticsRepository: PlayerStatisticsRepository,
  ) {}

  async execute(request: RegisterGoalUseCaseRequest) {
    return registerScoringEvent(
      { ...request, eventType: 'GOAL' },
      this.matchRepository,
      this.playerRepository,
      this.matchEventRepository,
      this.playerStatisticsRepository,
    )
  }
}
