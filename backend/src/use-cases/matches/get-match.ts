import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { Match, MatchRepository } from '@/repositories/match-repository'

export class GetMatchUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly matchRepository: MatchRepository,
  ) {}

  async execute(request: { championshipId: string; matchId: string }): Promise<{ match: Match }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const match = await this.matchRepository.findById(request.matchId)

    if (!match || match.championshipId !== request.championshipId) {
      throw errorMessage.matchNotFound
    }

    return { match }
  }
}
