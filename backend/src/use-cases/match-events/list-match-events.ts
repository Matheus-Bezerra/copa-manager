import { errorMessage } from '@/constants/error-message'
import type { MatchEvent, MatchEventRepository } from '@/repositories/match-event-repository'
import type { MatchRepository } from '@/repositories/match-repository'
import type { ChampionshipRepository } from '@/repositories/championship-repository'

export interface ListMatchEventsUseCaseRequest {
  championshipId: string
  matchId: string
}

export class ListMatchEventsUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly matchRepository: MatchRepository,
    private readonly matchEventRepository: MatchEventRepository,
  ) {}

  async execute(request: ListMatchEventsUseCaseRequest): Promise<{ events: MatchEvent[] }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const match = await this.matchRepository.findById(request.matchId)

    if (!match || match.championshipId !== request.championshipId) {
      throw errorMessage.matchNotFound
    }

    const events = await this.matchEventRepository.findByMatchId(request.matchId)

    return { events }
  }
}
