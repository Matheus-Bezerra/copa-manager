import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { GroupRepository } from '@/repositories/group-repository'
import type { StageRepository } from '@/repositories/stage-repository'
import type { StandingRepository } from '@/repositories/standing-repository'
import type { StandingEntry } from '@/use-cases/standings/get-standings'

export class GetPublicStandingsUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly stageRepository: StageRepository,
    private readonly groupRepository: GroupRepository,
    private readonly standingRepository: StandingRepository,
  ) {}

  async execute(request: {
    slug: string
    stageId: string
    groupId: string
  }): Promise<{ standings: StandingEntry[] }> {
    const championship = await this.championshipRepository.findBySlug(request.slug)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const stage = await this.stageRepository.findById(request.stageId)

    if (!stage || stage.championshipId !== championship.id) {
      throw errorMessage.stageNotFound
    }

    if (stage.type !== 'GROUP_STAGE') {
      throw errorMessage.standingGroupStageOnly
    }

    const group = await this.groupRepository.findById(request.groupId)

    if (!group || group.stageId !== request.stageId) {
      throw errorMessage.groupNotFound
    }

    const standings = await this.standingRepository.findByStageAndGroup(
      request.stageId,
      request.groupId,
    )

    return {
      standings: standings.map((s) => ({
        teamId: s.teamId,
        position: s.position,
        points: s.points,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        goalsScored: s.goalsScored,
        goalsConceded: s.goalsConceded,
        goalDifference: s.goalDifference,
      })),
    }
  }
}
