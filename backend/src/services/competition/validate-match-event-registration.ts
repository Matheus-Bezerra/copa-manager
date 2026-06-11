import { errorMessage } from '@/constants/error-message'
import type { Match, MatchStatus } from '@/repositories/match-repository'
import type { Player } from '@/repositories/player-repository'

export type MatchEventRegistrationMode = 'SCORING' | 'MVP'

const SCORING_ALLOWED_STATUSES: MatchStatus[] = ['IN_PROGRESS', 'FINISHED']

/**
 * Regra de status para registro de eventos:
 * - Gol e cartões: partida deve estar IN_PROGRESS ou FINISHED.
 * - MVP: partida deve estar FINISHED.
 * - Partidas SCHEDULED ou CANCELLED não aceitam eventos.
 */
export function assertMatchAllowsEventRegistration(
  match: Match,
  mode: MatchEventRegistrationMode,
): void {
  if (match.status === 'CANCELLED') {
    throw errorMessage.matchCancelled
  }

  if (mode === 'MVP') {
    if (match.status !== 'FINISHED') {
      throw errorMessage.matchMvpRequiresFinished
    }

    return
  }

  if (!SCORING_ALLOWED_STATUSES.includes(match.status)) {
    throw errorMessage.matchEventNotAllowed
  }
}

export function assertPlayerBelongsToMatch(match: Match, player: Player): void {
  if (!match.homeTeamId || !match.awayTeamId) {
    throw errorMessage.matchTeamsRequired
  }

  if (player.teamId !== match.homeTeamId && player.teamId !== match.awayTeamId) {
    throw errorMessage.playerNotInMatch
  }
}

export function assertTeamBelongsToMatch(match: Match, teamId: string): void {
  if (!match.homeTeamId || !match.awayTeamId) {
    throw errorMessage.matchTeamsRequired
  }

  if (teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
    throw errorMessage.teamNotInMatch
  }
}
