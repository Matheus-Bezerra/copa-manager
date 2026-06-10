import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { ListMatchesFilters, Match, MatchRepository } from '@/repositories/match-repository'

export class ListPublicMatchesUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly matchRepository: MatchRepository,
  ) {}

  async execute(request: {
    slug: string
    filters?: ListMatchesFilters
  }): Promise<{ matches: Match[] }> {
    const championship = await this.championshipRepository.findBySlug(request.slug)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const matches = await this.matchRepository.findByChampionshipId(
      championship.id,
      request.filters,
    )

    return { matches }
  }
}
