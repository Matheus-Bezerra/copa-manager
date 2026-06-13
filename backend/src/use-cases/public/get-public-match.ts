import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { ChampionshipRulesRepository } from '@/repositories/championship-rules-repository'
import type { Match, MatchRepository } from '@/repositories/match-repository'
import type { MatchResult, MatchResultRepository } from '@/repositories/match-result-repository'
import { toChampionshipRulesResponse } from '@/services/competition/resolve-standings-config'

export class GetPublicMatchUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly matchRepository: MatchRepository,
    private readonly matchResultRepository: MatchResultRepository,
    private readonly championshipRulesRepository: ChampionshipRulesRepository,
  ) {}

  async execute(request: {
    slug: string
    matchId: string
  }): Promise<{ match: Match; result: MatchResult | null; matchDuration: number }> {
    const championship = await this.championshipRepository.findBySlug(request.slug)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const match = await this.matchRepository.findById(request.matchId)

    if (!match || match.championshipId !== championship.id) {
      throw errorMessage.matchNotFound
    }

    const [result, rules] = await Promise.all([
      this.matchResultRepository.findByMatchId(request.matchId),
      this.championshipRulesRepository.findByChampionshipId(championship.id),
    ])

    return {
      match,
      result,
      matchDuration: toChampionshipRulesResponse(rules).matchDuration,
    }
  }
}
