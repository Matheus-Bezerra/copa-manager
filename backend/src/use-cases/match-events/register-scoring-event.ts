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
  assertTeamBelongsToMatch,
} from '@/services/competition/validate-match-event-registration'

export interface RegisterScoringEventRequest {
  championshipId: string
  matchId: string
  playerId?: string | null
  teamId?: string | null
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

  let resolvedPlayerId: string | null = null
  let resolvedTeamId: string | null = null

  if (request.playerId) {
    const player = await playerRepository.findById(request.playerId)

    if (!player) {
      throw errorMessage.playerNotFound
    }

    assertPlayerBelongsToMatch(match, player)

    resolvedPlayerId = request.playerId
    resolvedTeamId = player.teamId
  } else if (request.teamId) {
    if (request.eventType !== 'GOAL') {
      throw errorMessage.matchEventRequiresPlayer
    }

    assertTeamBelongsToMatch(match, request.teamId)

    resolvedTeamId = request.teamId
  } else {
    throw errorMessage.goalRequiresPlayerOrTeam
  }

  let countMatchPlayed = false

  if (resolvedPlayerId && match.status !== 'FINISHED') {
    const hasParticipated = await matchEventRepository.existsByMatchIdAndPlayerId(
      request.matchId,
      resolvedPlayerId,
    )

    countMatchPlayed = !hasParticipated
  }

  const event = await matchEventRepository.create({
    id: ulid(),
    matchId: request.matchId,
    playerId: resolvedPlayerId,
    teamId: resolvedTeamId,
    eventType: request.eventType,
    minute: request.minute ?? null,
  })

  if (resolvedPlayerId) {
    await incrementPlayerStatisticsFromEvent(
      playerStatisticsRepository,
      resolvedPlayerId,
      request.eventType,
      { countMatchPlayed },
    )
  }

  return { event }
}
