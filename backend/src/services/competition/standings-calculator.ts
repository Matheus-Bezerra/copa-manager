import type { MatchWithResult } from '@/repositories/match-repository'

export interface ScoringRules {
  winPoints: number
  drawPoints: number
  penaltyBonusPoints: number
}

export interface TeamStandingStats {
  teamId: string
  points: number
  wins: number
  draws: number
  losses: number
  goalsScored: number
  goalsConceded: number
  goalDifference: number
}

export const DEFAULT_SCORING_RULES: ScoringRules = {
  winPoints: 3,
  drawPoints: 1,
  penaltyBonusPoints: 0,
}

function createEmptyStats(teamId: string): TeamStandingStats {
  return {
    teamId,
    points: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsScored: 0,
    goalsConceded: 0,
    goalDifference: 0,
  }
}

function getPenaltyWinner(
  homePenaltyScore: number | null,
  awayPenaltyScore: number | null,
): 'HOME' | 'AWAY' | null {
  if (homePenaltyScore === null || awayPenaltyScore === null) {
    return null
  }

  if (homePenaltyScore === awayPenaltyScore) {
    return null
  }

  return homePenaltyScore > awayPenaltyScore ? 'HOME' : 'AWAY'
}

export function calculateTeamStats(
  matches: MatchWithResult[],
  rules: ScoringRules = DEFAULT_SCORING_RULES,
): TeamStandingStats[] {
  const statsMap = new Map<string, TeamStandingStats>()

  for (const match of matches) {
    if (!match.homeTeamId || !match.awayTeamId) {
      continue
    }

    const { homeScore, awayScore, homePenaltyScore, awayPenaltyScore } = match.result

    if (!statsMap.has(match.homeTeamId)) {
      statsMap.set(match.homeTeamId, createEmptyStats(match.homeTeamId))
    }

    if (!statsMap.has(match.awayTeamId)) {
      statsMap.set(match.awayTeamId, createEmptyStats(match.awayTeamId))
    }

    const homeStats = statsMap.get(match.homeTeamId)!
    const awayStats = statsMap.get(match.awayTeamId)!

    homeStats.goalsScored += homeScore
    homeStats.goalsConceded += awayScore
    awayStats.goalsScored += awayScore
    awayStats.goalsConceded += homeScore

    if (homeScore > awayScore) {
      homeStats.wins += 1
      homeStats.points += rules.winPoints
      awayStats.losses += 1
    } else if (awayScore > homeScore) {
      awayStats.wins += 1
      awayStats.points += rules.winPoints
      homeStats.losses += 1
    } else {
      homeStats.draws += 1
      awayStats.draws += 1
      homeStats.points += rules.drawPoints
      awayStats.points += rules.drawPoints

      const penaltyWinner = getPenaltyWinner(homePenaltyScore, awayPenaltyScore)

      if (penaltyWinner && rules.penaltyBonusPoints > 0) {
        if (penaltyWinner === 'HOME') {
          homeStats.points += rules.penaltyBonusPoints
        } else {
          awayStats.points += rules.penaltyBonusPoints
        }
      }
    }
  }

  return Array.from(statsMap.values()).map((stats) => ({
    ...stats,
    goalDifference: stats.goalsScored - stats.goalsConceded,
  }))
}
