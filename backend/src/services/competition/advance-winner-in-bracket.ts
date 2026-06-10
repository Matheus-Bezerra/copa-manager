import type { MatchBracketLinkRepository } from '@/repositories/match-bracket-link-repository'
import type { MatchRepository } from '@/repositories/match-repository'
import { fillMatchSlot } from '@/services/competition/fill-match-slot'

export async function advanceWinnerInBracket(
  fromMatchId: string,
  winnerId: string,
  matchRepository: MatchRepository,
  bracketLinkRepository: MatchBracketLinkRepository,
): Promise<void> {
  const links = await bracketLinkRepository.findByFromMatchId(fromMatchId)

  for (const link of links) {
    if (link.outcome !== 'WINNER') {
      continue
    }

    await fillMatchSlot(matchRepository, link.toMatchId, link.toSlot, winnerId)
  }
}
