import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { ListMatchesFilters, Match, MatchRepository } from '@/repositories/match-repository'

export class ListMatchesUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly matchRepository: MatchRepository,
  ) {}

  async execute(request: {
    championshipId: string
    filters?: ListMatchesFilters
  }): Promise<{ matches: Match[] }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const matches = await this.matchRepository.findByChampionshipId(
      request.championshipId,
      request.filters,
    )

    return { matches }
  }
}
