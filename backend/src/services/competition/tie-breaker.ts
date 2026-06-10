import type { MatchWithResult } from '@/repositories/match-repository'
import type { TeamStandingStats } from '@/services/competition/standings-calculator'

export type TieBreakerCriterion =
  | 'POINTS'
  | 'WINS'
  | 'GOAL_DIFFERENCE'
  | 'GOALS_SCORED'
  | 'HEAD_TO_HEAD'

export const DEFAULT_TIE_BREAKER_CRITERIA: TieBreakerCriterion[] = [
  'WINS',
  'GOAL_DIFFERENCE',
  'GOALS_SCORED',
  'HEAD_TO_HEAD',
]

export function normalizeTieBreakerCriterion(criterion: string): TieBreakerCriterion | null {
  const normalized = criterion
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toUpperCase()

  switch (normalized) {
    case 'POINTS':
      return 'POINTS'
    case 'WINS':
    case 'WIN':
      return 'WINS'
    case 'GOAL_DIFFERENCE':
    case 'GOAL_DIFF':
    case 'GOALDIFFERENCE':
      return 'GOAL_DIFFERENCE'
    case 'GOALS_SCORED':
    case 'GOALS_FOR':
    case 'GOALSSCORED':
      return 'GOALS_SCORED'
    case 'HEAD_TO_HEAD':
    case 'HEADTOHEAD':
      return 'HEAD_TO_HEAD'
    default:
      return null
  }
}

function compareHeadToHead(
  teamA: string,
  teamB: string,
  matches: MatchWithResult[],
): number {
  const directMatches = matches.filter(
    (match) =>
      (match.homeTeamId === teamA && match.awayTeamId === teamB) ||
      (match.homeTeamId === teamB && match.awayTeamId === teamA),
  )

  if (directMatches.length === 0) {
    return 0
  }

  let pointsA = 0
  let pointsB = 0

  for (const match of directMatches) {
    const { homeScore, awayScore } = match.result

    if (match.homeTeamId === teamA) {
      if (homeScore > awayScore) pointsA += 3
      else if (homeScore === awayScore) {
        pointsA += 1
        pointsB += 1
      } else pointsB += 3
    } else if (homeScore > awayScore) pointsB += 3
    else if (homeScore === awayScore) {
      pointsA += 1
      pointsB += 1
    } else pointsA += 3
  }

  return pointsB - pointsA
}

function compareByCriterion(
  teamA: TeamStandingStats,
  teamB: TeamStandingStats,
  criterion: TieBreakerCriterion,
  matches: MatchWithResult[],
): number {
  switch (criterion) {
    case 'POINTS':
      return teamB.points - teamA.points
    case 'WINS':
      return teamB.wins - teamA.wins
    case 'GOAL_DIFFERENCE':
      return teamB.goalDifference - teamA.goalDifference
    case 'GOALS_SCORED':
      return teamB.goalsScored - teamA.goalsScored
    case 'HEAD_TO_HEAD':
      return compareHeadToHead(teamA.teamId, teamB.teamId, matches)
    default:
      return 0
  }
}

export function sortStandings(
  stats: TeamStandingStats[],
  criteria: TieBreakerCriterion[],
  matches: MatchWithResult[],
): TeamStandingStats[] {
  const sorted = [...stats].sort((teamA, teamB) => {
    const pointsDiff = teamB.points - teamA.points

    if (pointsDiff !== 0) {
      return pointsDiff
    }

    for (const criterion of criteria) {
      const diff = compareByCriterion(teamA, teamB, criterion, matches)

      if (diff !== 0) {
        return diff
      }
    }

    return teamA.teamId.localeCompare(teamB.teamId)
  })

  return sorted
}

export function assignPositions(stats: TeamStandingStats[]): Array<TeamStandingStats & { position: number }> {
  return stats.map((entry, index) => ({
    ...entry,
    position: index + 1,
  }))
}
