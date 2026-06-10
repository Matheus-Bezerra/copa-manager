import { ulid } from 'ulidx'
import { errorMessage } from '@/constants/error-message'
import type { Award, AwardRepository, AwardType } from '@/repositories/award-repository'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { PlayerRepository } from '@/repositories/player-repository'
import type { TeamRepository } from '@/repositories/team-repository'

export interface GrantAwardUseCaseRequest {
  championshipId: string
  playerId: string
  awardType: AwardType
}

export class GrantAwardUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly teamRepository: TeamRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly awardRepository: AwardRepository,
  ) {}

  async execute(request: GrantAwardUseCaseRequest): Promise<{ award: Award }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const player = await this.playerRepository.findById(request.playerId)

    if (!player) {
      throw errorMessage.playerNotFound
    }

    const team = await this.teamRepository.findById(player.teamId)

    if (!team || team.championshipId !== request.championshipId) {
      throw errorMessage.playerNotFound
    }

    const award = await this.awardRepository.create({
      id: ulid(),
      championshipId: request.championshipId,
      playerId: request.playerId,
      awardType: request.awardType,
    })

    return { award }
  }
}
