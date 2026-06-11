import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { MatchEvent, MatchEventRepository } from '@/repositories/match-event-repository'
import type { MatchRepository } from '@/repositories/match-repository'

export class ListPublicMatchEventsUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly matchRepository: MatchRepository,
    private readonly matchEventRepository: MatchEventRepository,
  ) {}

  async execute(request: {
    slug: string
    matchId: string
  }): Promise<{ events: MatchEvent[] }> {
    const championship = await this.championshipRepository.findBySlug(request.slug)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const match = await this.matchRepository.findById(request.matchId)

    if (!match || match.championshipId !== championship.id) {
      throw errorMessage.matchNotFound
    }

    const events = await this.matchEventRepository.findByMatchId(request.matchId)

    return { events }
  }
}
