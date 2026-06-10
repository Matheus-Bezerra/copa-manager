export interface KnockoutRoundDef {
  number: number
  name: string
}

const ROUND_NAMES_BY_DEPTH: Record<number, string> = {
  1: 'Final',
  2: 'Semifinal',
  3: 'Quartas de Final',
  4: 'Oitavas de Final',
  5: '16 avos de Final',
  6: '32 avos de Final',
}

/**
 * Returns the ordered round definitions for a KNOCKOUT stage.
 * Rounds are ordered from the first (most teams) to the last (Final).
 * If thirdPlaceMatch is true, an extra "3º Lugar" round is appended.
 *
 * Examples:
 *   qualifiedTeams=4, thirdPlaceMatch=true  → [Semifinal, Final, 3º Lugar]
 *   qualifiedTeams=8, thirdPlaceMatch=false → [Quartas de Final, Semifinal, Final]
 */
export function calculateKnockoutRounds(
  qualifiedTeams: number,
  thirdPlaceMatch: boolean,
): KnockoutRoundDef[] {
  const depth = Math.log2(qualifiedTeams)
  const rounds: KnockoutRoundDef[] = []

  for (let d = depth; d >= 1; d--) {
    const name = ROUND_NAMES_BY_DEPTH[d] ?? `${Math.pow(2, d)} avos de Final`
    rounds.push({ number: rounds.length + 1, name })
  }

  if (thirdPlaceMatch && depth >= 2) {
    rounds.push({ number: rounds.length + 1, name: '3º Lugar' })
  }

  return rounds
}

/**
 * Returns the index (0-based) of the semifinal round within the rounds array.
 * The semifinal is always the round just before the Final.
 */
export function getSemifinalIndex(qualifiedTeams: number): number {
  const depth = Math.log2(qualifiedTeams)
  return depth - 2
}
