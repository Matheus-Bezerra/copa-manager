import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { Match, MatchRepository } from '@/repositories/match-repository'
import type { TeamRepository } from '@/repositories/team-repository'

export interface UpdateMatchUseCaseRequest {
  championshipId: string
  matchId: string
  homeTeamId?: string | null
  awayTeamId?: string | null
  scheduledAt?: Date | null
}

export class UpdateMatchUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly teamRepository: TeamRepository,
    private readonly matchRepository: MatchRepository,
  ) {}

  async execute(request: UpdateMatchUseCaseRequest): Promise<{ match: Match }> {
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

    const homeTeamId = request.homeTeamId !== undefined ? request.homeTeamId : match.homeTeamId
    const awayTeamId = request.awayTeamId !== undefined ? request.awayTeamId : match.awayTeamId

    if (request.homeTeamId !== undefined && request.homeTeamId !== null) {
      const homeTeam = await this.teamRepository.findById(request.homeTeamId)

      if (!homeTeam || homeTeam.championshipId !== request.championshipId) {
        throw errorMessage.teamNotFound
      }
    }

    if (request.awayTeamId !== undefined && request.awayTeamId !== null) {
      const awayTeam = await this.teamRepository.findById(request.awayTeamId)

      if (!awayTeam || awayTeam.championshipId !== request.championshipId) {
        throw errorMessage.teamNotFound
      }
    }

    if (homeTeamId && awayTeamId && homeTeamId === awayTeamId) {
      throw errorMessage.matchSameTeam
    }

    const updated = await this.matchRepository.update(request.matchId, {
      homeTeamId: request.homeTeamId,
      awayTeamId: request.awayTeamId,
      scheduledAt: request.scheduledAt,
    })

    return { match: updated }
  }
}
