import type { BracketLinkSlot } from '@/repositories/match-bracket-link-repository'
import type { MatchRepository } from '@/repositories/match-repository'

export async function fillMatchSlot(
  matchRepository: MatchRepository,
  toMatchId: string,
  slot: BracketLinkSlot,
  teamId: string,
): Promise<void> {
  if (slot === 'HOME') {
    await matchRepository.update(toMatchId, { homeTeamId: teamId })
    return
  }

  await matchRepository.update(toMatchId, { awayTeamId: teamId })
}

export async function clearMatchSlot(
  matchRepository: MatchRepository,
  toMatchId: string,
  slot: BracketLinkSlot,
): Promise<void> {
  if (slot === 'HOME') {
    await matchRepository.update(toMatchId, { homeTeamId: null })
    return
  }

  await matchRepository.update(toMatchId, { awayTeamId: null })
}
