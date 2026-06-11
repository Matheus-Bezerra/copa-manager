import type { StageFormat } from '@/repositories/stage-repository'

/**
 * Single round-robin scheduling rounds for N teams.
 * Even N: N - 1 rounds (N/2 matches per round).
 * Odd N: N rounds (floor(N/2) matches per round, one bye).
 */
function singleRoundRobinRounds(teamCount: number): number {
  return teamCount % 2 === 0 ? teamCount - 1 : teamCount
}

/**
 * Calculates number of rounds for a group stage.
 * ROUND_ROBIN: each pair meets once across N-1 (even) or N (odd) rounds.
 * DOUBLE_ROUND_ROBIN: each pair meets twice — double the single round-robin rounds.
 */
export function calculateGroupStageRounds(format: StageFormat, maxTeamsInGroup: number): number {
  const singleRounds = singleRoundRobinRounds(maxTeamsInGroup)

  if (format === 'ROUND_ROBIN') {
    return singleRounds
  }

  return singleRounds * 2
}
