import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { Match, MatchRepository } from '@/repositories/match-repository'
import type { MatchResult, MatchResultRepository } from '@/repositories/match-result-repository'

export class GetMatchUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly matchRepository: MatchRepository,
    private readonly matchResultRepository: MatchResultRepository,
  ) {}

  async execute(
    request: { championshipId: string; matchId: string },
  ): Promise<{ match: Match; result: MatchResult | null }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const match = await this.matchRepository.findById(request.matchId)

    if (!match || match.championshipId !== request.championshipId) {
      throw errorMessage.matchNotFound
    }

    const result = await this.matchResultRepository.findByMatchId(request.matchId)

    return { match, result }
  }
}
