import { ulid } from 'ulidx'
import { errorMessage } from '@/constants/error-message'
import type { MatchEvent, MatchEventRepository } from '@/repositories/match-event-repository'
import type { MatchRepository } from '@/repositories/match-repository'
import type { PlayerRepository } from '@/repositories/player-repository'
import type { PlayerStatisticsRepository } from '@/repositories/player-statistics-repository'
import {
  decrementPlayerStatisticsFromEvent,
  incrementPlayerStatisticsFromEvent,
} from '@/services/competition/update-player-statistics-from-event'
import {
  assertMatchAllowsEventRegistration,
  assertPlayerBelongsToMatch,
} from '@/services/competition/validate-match-event-registration'

export interface DefineMatchMvpUseCaseRequest {
  championshipId: string
  matchId: string
  playerId: string
}

export class DefineMatchMvpUseCase {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly matchEventRepository: MatchEventRepository,
    private readonly playerStatisticsRepository: PlayerStatisticsRepository,
  ) {}

  async execute(request: DefineMatchMvpUseCaseRequest): Promise<{ event: MatchEvent }> {
    const match = await this.matchRepository.findById(request.matchId)

    if (!match || match.championshipId !== request.championshipId) {
      throw errorMessage.matchNotFound
    }

    assertMatchAllowsEventRegistration(match, 'MVP')

    const player = await this.playerRepository.findById(request.playerId)

    if (!player) {
      throw errorMessage.playerNotFound
    }

    assertPlayerBelongsToMatch(match, player)

    const existingMvpEvents = await this.matchEventRepository.findByMatchIdAndType(
      request.matchId,
      'MVP',
    )

    for (const existingEvent of existingMvpEvents) {
      if (existingEvent.playerId) {
        await decrementPlayerStatisticsFromEvent(
          this.playerStatisticsRepository,
          existingEvent.playerId,
          'MVP',
        )
      }

      await this.matchEventRepository.delete(existingEvent.id)
    }

    const event = await this.matchEventRepository.create({
      id: ulid(),
      matchId: request.matchId,
      playerId: request.playerId,
      teamId: player.teamId,
      eventType: 'MVP',
      minute: null,
    })

    await incrementPlayerStatisticsFromEvent(
      this.playerStatisticsRepository,
      request.playerId,
      'MVP',
    )

    return { event }
  }
}
