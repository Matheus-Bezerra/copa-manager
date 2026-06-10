import type { StageFormat } from '@/repositories/stage-repository'

/**
 * Calculates number of rounds for a group stage.
 * ROUND_ROBIN: N*(N-1)/2 — each pair of teams meets once.
 * DOUBLE_ROUND_ROBIN: N*(N-1) — each pair meets twice (home & away).
 */
export function calculateGroupStageRounds(format: StageFormat, maxTeamsInGroup: number): number {
  const N = maxTeamsInGroup

  if (format === 'ROUND_ROBIN') {
    return (N * (N - 1)) / 2
  }

  return N * (N - 1)
}
