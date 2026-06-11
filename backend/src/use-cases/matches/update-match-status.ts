import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { Match, MatchRepository } from '@/repositories/match-repository'

export interface UpdateMatchStatusUseCaseRequest {
  championshipId: string
  matchId: string
  status: 'IN_PROGRESS' | 'CANCELLED'
}

export class UpdateMatchStatusUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly matchRepository: MatchRepository,
  ) {}

  async execute(request: UpdateMatchStatusUseCaseRequest): Promise<{ match: Match }> {
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

    if (request.status === 'IN_PROGRESS') {
      if (match.status !== 'SCHEDULED') {
        throw errorMessage.matchCancelled
      }

      if (!match.homeTeamId || !match.awayTeamId) {
        throw errorMessage.matchTeamsRequired
      }
    }

    if (request.status === 'CANCELLED' && match.status === 'CANCELLED') {
      throw errorMessage.matchCancelled
    }

    const updated = await this.matchRepository.update(request.matchId, {
      status: request.status,
      ...(request.status === 'IN_PROGRESS' ? { startedAt: new Date() } : {}),
    })

    return { match: updated }
  }
}
