import type { MatchBracketLinkRepository } from '@/repositories/match-bracket-link-repository'
import type { MatchRepository } from '@/repositories/match-repository'
import { clearMatchSlot } from '@/services/competition/fill-match-slot'

export async function revertBracketCascade(
  fromMatchId: string,
  matchRepository: MatchRepository,
  bracketLinkRepository: MatchBracketLinkRepository,
  visited: Set<string> = new Set(),
): Promise<void> {
  if (visited.has(fromMatchId)) {
    return
  }

  visited.add(fromMatchId)

  const links = await bracketLinkRepository.findByFromMatchId(fromMatchId)

  for (const link of links) {
    await clearMatchSlot(matchRepository, link.toMatchId, link.toSlot)
    await revertBracketCascade(link.toMatchId, matchRepository, bracketLinkRepository, visited)
  }
}
