import type { MatchEventRepository } from '@/repositories/match-event-repository'
import type { Match } from '@/repositories/match-repository'
import type { MatchResultRepository } from '@/repositories/match-result-repository'

export type MatchListItem = Match & {
  homeScore: number | null
  awayScore: number | null
}

export async function enrichMatchesWithScores(
  matches: Match[],
  matchResultRepository: MatchResultRepository,
  matchEventRepository: MatchEventRepository,
): Promise<MatchListItem[]> {
  if (matches.length === 0) {
    return []
  }

  const matchIds = matches.map((match) => match.id)
  const results = await matchResultRepository.findByMatchIds(matchIds)
  const resultByMatchId = new Map(results.map((result) => [result.matchId, result]))

  const inProgressMatchIds = matches
    .filter((match) => match.status === 'IN_PROGRESS')
    .map((match) => match.id)

  const goalEvents =
    inProgressMatchIds.length > 0
      ? await matchEventRepository.findGoalsByMatchIds(inProgressMatchIds)
      : []

  const goalsByMatchId = new Map<string, Array<{ teamId: string | null }>>()

  for (const event of goalEvents) {
    const goals = goalsByMatchId.get(event.matchId) ?? []
    goals.push({ teamId: event.teamId })
    goalsByMatchId.set(event.matchId, goals)
  }

  return matches.map((match) => {
    const result = resultByMatchId.get(match.id) ?? null

    if (match.status === 'FINISHED' && result) {
      return {
        ...match,
        homeScore: result.homeScore,
        awayScore: result.awayScore,
      }
    }

    if (match.status === 'IN_PROGRESS') {
      const goals = goalsByMatchId.get(match.id) ?? []

      return {
        ...match,
        homeScore: goals.filter((goal) => goal.teamId === match.homeTeamId).length,
        awayScore: goals.filter((goal) => goal.teamId === match.awayTeamId).length,
      }
    }

    return {
      ...match,
      homeScore: null,
      awayScore: null,
    }
  })
}
