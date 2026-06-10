import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { Match, MatchRepository } from '@/repositories/match-repository'

export class CancelMatchUseCase {
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

    if (match.status === 'FINISHED') {
      throw errorMessage.matchAlreadyFinished
    }

    if (match.status === 'CANCELLED') {
      throw errorMessage.matchCancelled
    }

    const updated = await this.matchRepository.update(request.matchId, { status: 'CANCELLED' })

    return { match: updated }
  }
}
