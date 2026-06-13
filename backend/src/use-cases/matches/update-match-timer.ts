import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { Match, MatchRepository } from '@/repositories/match-repository'

export interface UpdateMatchTimerUseCaseRequest {
  championshipId: string
  matchId: string
  action: 'PAUSE' | 'RESUME'
}

export class UpdateMatchTimerUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly matchRepository: MatchRepository,
  ) {}

  async execute(request: UpdateMatchTimerUseCaseRequest): Promise<{ match: Match }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const match = await this.matchRepository.findById(request.matchId)

    if (!match || match.championshipId !== request.championshipId) {
      throw errorMessage.matchNotFound
    }

    if (match.status !== 'IN_PROGRESS') {
      throw errorMessage.matchNotInProgress
    }

    if (!match.startedAt) {
      throw errorMessage.matchTimerUnavailable
    }

    if (request.action === 'PAUSE') {
      if (match.pausedAt) {
        throw errorMessage.matchTimerAlreadyPaused
      }

      const updated = await this.matchRepository.update(request.matchId, {
        pausedAt: new Date(),
      })

      return { match: updated }
    }

    if (!match.pausedAt) {
      throw errorMessage.matchTimerNotPaused
    }

    const pauseDurationMs = Date.now() - match.pausedAt.getTime()
    const updated = await this.matchRepository.update(request.matchId, {
      pausedAt: null,
      accumulatedPausedMs: match.accumulatedPausedMs + pauseDurationMs,
    })

    return { match: updated }
  }
}
