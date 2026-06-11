import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { Match, MatchRepository } from '@/repositories/match-repository'
import type { MatchResult, MatchResultRepository } from '@/repositories/match-result-repository'

export class GetPublicMatchUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly matchRepository: MatchRepository,
    private readonly matchResultRepository: MatchResultRepository,
  ) {}

  async execute(request: {
    slug: string
    matchId: string
  }): Promise<{ match: Match; result: MatchResult | null }> {
    const championship = await this.championshipRepository.findBySlug(request.slug)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const match = await this.matchRepository.findById(request.matchId)

    if (!match || match.championshipId !== championship.id) {
      throw errorMessage.matchNotFound
    }

    const result = await this.matchResultRepository.findByMatchId(request.matchId)

    return { match, result }
  }
}
