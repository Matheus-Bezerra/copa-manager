import { ulid } from 'ulidx'
import { errorMessage } from '@/constants/error-message'
import type { MatchEvent, MatchEventRepository, MatchEventType } from '@/repositories/match-event-repository'
import type { MatchRepository } from '@/repositories/match-repository'
import type { PlayerRepository } from '@/repositories/player-repository'
import type { PlayerStatisticsRepository } from '@/repositories/player-statistics-repository'
import { incrementPlayerStatisticsFromEvent } from '@/services/competition/update-player-statistics-from-event'
import {
  assertMatchAllowsEventRegistration,
  assertPlayerBelongsToMatch,
} from '@/services/competition/validate-match-event-registration'

export interface RegisterScoringEventRequest {
  championshipId: string
  matchId: string
  playerId: string
  minute?: number | null
  eventType: Exclude<MatchEventType, 'MVP'>
}

export async function registerScoringEvent(
  request: RegisterScoringEventRequest,
  matchRepository: MatchRepository,
  playerRepository: PlayerRepository,
  matchEventRepository: MatchEventRepository,
  playerStatisticsRepository: PlayerStatisticsRepository,
): Promise<{ event: MatchEvent }> {
  const match = await matchRepository.findById(request.matchId)

  if (!match || match.championshipId !== request.championshipId) {
    throw errorMessage.matchNotFound
  }

  assertMatchAllowsEventRegistration(match, 'SCORING')

  const player = await playerRepository.findById(request.playerId)

  if (!player) {
    throw errorMessage.playerNotFound
  }

  assertPlayerBelongsToMatch(match, player)

  const event = await matchEventRepository.create({
    id: ulid(),
    matchId: request.matchId,
    playerId: request.playerId,
    teamId: player.teamId,
    eventType: request.eventType,
    minute: request.minute ?? null,
  })

  await incrementPlayerStatisticsFromEvent(
    playerStatisticsRepository,
    request.playerId,
    request.eventType,
  )

  return { event }
}
