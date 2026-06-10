import type { MatchResultSummary } from '@/repositories/match-repository'

export interface MatchOutcomeTeams {
  homeTeamId: string
  awayTeamId: string
}

export interface ResolvedMatchOutcome {
  winnerId: string
  loserId: string
}

export function resolveMatchOutcome(
  teams: MatchOutcomeTeams,
  result: MatchResultSummary,
): ResolvedMatchOutcome {
  const { homeTeamId, awayTeamId } = teams
  const { homeScore, awayScore, homePenaltyScore, awayPenaltyScore } = result

  if (homeScore > awayScore) {
    return { winnerId: homeTeamId, loserId: awayTeamId }
  }

  if (awayScore > homeScore) {
    return { winnerId: awayTeamId, loserId: homeTeamId }
  }

  if (homePenaltyScore !== null && awayPenaltyScore !== null) {
    if (homePenaltyScore > awayPenaltyScore) {
      return { winnerId: homeTeamId, loserId: awayTeamId }
    }

    if (awayPenaltyScore > homePenaltyScore) {
      return { winnerId: awayTeamId, loserId: homeTeamId }
    }
  }

  throw new Error('KNOCKOUT_DRAW_REQUIRES_PENALTIES')
}
