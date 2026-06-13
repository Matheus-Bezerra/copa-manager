import { errorMessage } from '@/constants/error-message'

export interface MatchPenaltyScoreInput {
  homeScore: number
  awayScore: number
  homePenaltyScore?: number | null
  awayPenaltyScore?: number | null
}

export interface NormalizedMatchPenaltyScores {
  homePenaltyScore: number | null
  awayPenaltyScore: number | null
}

export function normalizeMatchPenaltyScores(
  input: MatchPenaltyScoreInput,
): NormalizedMatchPenaltyScores {
  const homePenaltyScore = input.homePenaltyScore ?? null
  const awayPenaltyScore = input.awayPenaltyScore ?? null
  const isDraw = input.homeScore === input.awayScore

  if (!isDraw) {
    if (homePenaltyScore !== null || awayPenaltyScore !== null) {
      throw errorMessage.matchPenaltyScoresNotAllowed
    }

    return { homePenaltyScore: null, awayPenaltyScore: null }
  }

  const hasHomePenalty = homePenaltyScore !== null
  const hasAwayPenalty = awayPenaltyScore !== null

  if (hasHomePenalty !== hasAwayPenalty) {
    throw errorMessage.matchPenaltyScoresIncomplete
  }

  return { homePenaltyScore, awayPenaltyScore }
}
