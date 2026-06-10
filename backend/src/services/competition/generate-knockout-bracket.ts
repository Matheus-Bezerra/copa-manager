import type { BracketLinkOutcome, BracketLinkSlot } from '@/repositories/match-bracket-link-repository'

export interface BracketRound {
  id: string
  number: number
  name: string
}

export interface BracketMatchDef {
  id: string
  roundId: string
  championshipId: string
}

export interface BracketLinkDef {
  id: string
  fromMatchId: string
  toMatchId: string
  outcome: BracketLinkOutcome
  toSlot: BracketLinkSlot
}

export interface KnockoutBracketResult {
  matches: BracketMatchDef[]
  bracketLinks: BracketLinkDef[]
}

/**
 * Generates placeholder matches and MatchBracketLinks for a KNOCKOUT stage.
 *
 * Structure:
 *   - Round r has qualifiedTeams / 2^r matches (r starting at 1)
 *   - Winner of match j (0-indexed) in round r feeds:
 *       match floor(j/2) in round r+1
 *       j even → HOME slot; j odd → AWAY slot
 *   - If thirdPlaceMatch: loser of each semifinal match feeds the 3rd place match
 *       match 0 loser → HOME; match 1 loser → AWAY
 */
export function generateKnockoutBracket(
  rounds: BracketRound[],
  qualifiedTeams: number,
  thirdPlaceMatch: boolean,
  championshipId: string,
  generateId: () => string,
): KnockoutBracketResult {
  const depth = Math.log2(qualifiedTeams)
  const regularRounds = thirdPlaceMatch && depth >= 2 ? rounds.slice(0, -1) : rounds
  const thirdPlaceRound = thirdPlaceMatch && depth >= 2 ? rounds[rounds.length - 1] : null

  const matchesByRound: BracketMatchDef[][] = []
  const allMatches: BracketMatchDef[] = []
  const bracketLinks: BracketLinkDef[] = []

  for (let i = 0; i < regularRounds.length; i++) {
    const round = regularRounds[i]
    const matchCount = qualifiedTeams / Math.pow(2, i + 1)
    const roundMatches: BracketMatchDef[] = []

    for (let j = 0; j < matchCount; j++) {
      const match: BracketMatchDef = { id: generateId(), roundId: round.id, championshipId }
      roundMatches.push(match)
      allMatches.push(match)
    }

    matchesByRound.push(roundMatches)
  }

  for (let i = 0; i < matchesByRound.length - 1; i++) {
    const currentRound = matchesByRound[i]
    const nextRound = matchesByRound[i + 1]

    for (let j = 0; j < currentRound.length; j++) {
      const toMatch = nextRound[Math.floor(j / 2)]
      const toSlot: BracketLinkSlot = j % 2 === 0 ? 'HOME' : 'AWAY'

      bracketLinks.push({
        id: generateId(),
        fromMatchId: currentRound[j].id,
        toMatchId: toMatch.id,
        outcome: 'WINNER',
        toSlot,
      })
    }
  }

  if (thirdPlaceRound) {
    const semifinalMatches = matchesByRound[matchesByRound.length - 2]

    if (semifinalMatches && semifinalMatches.length >= 2) {
      const thirdPlaceMatch: BracketMatchDef = {
        id: generateId(),
        roundId: thirdPlaceRound.id,
        championshipId,
      }
      allMatches.push(thirdPlaceMatch)

      const slots: BracketLinkSlot[] = ['HOME', 'AWAY']

      for (let k = 0; k < 2; k++) {
        bracketLinks.push({
          id: generateId(),
          fromMatchId: semifinalMatches[k].id,
          toMatchId: thirdPlaceMatch.id,
          outcome: 'LOSER',
          toSlot: slots[k],
        })
      }
    }
  }

  return { matches: allMatches, bracketLinks }
}
