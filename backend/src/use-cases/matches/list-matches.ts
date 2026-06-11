import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { MatchEventRepository } from '@/repositories/match-event-repository'
import type { ListMatchesFilters, MatchRepository } from '@/repositories/match-repository'
import type { MatchResultRepository } from '@/repositories/match-result-repository'
import {
  enrichMatchesWithScores,
  type MatchListItem,
} from '@/services/competition/enrich-matches-with-scores'

export class ListMatchesUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly matchRepository: MatchRepository,
    private readonly matchResultRepository: MatchResultRepository,
    private readonly matchEventRepository: MatchEventRepository,
  ) {}

  async execute(request: {
    championshipId: string
    filters?: ListMatchesFilters
  }): Promise<{ matches: MatchListItem[] }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const matches = await this.matchRepository.findByChampionshipId(
      request.championshipId,
      request.filters,
    )

    const matchesWithScores = await enrichMatchesWithScores(
      matches,
      this.matchResultRepository,
      this.matchEventRepository,
    )

    return { matches: matchesWithScores }
  }
}
