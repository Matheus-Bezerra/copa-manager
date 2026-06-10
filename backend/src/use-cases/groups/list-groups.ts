import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { Group, GroupRepository } from '@/repositories/group-repository'
import type { StageRepository } from '@/repositories/stage-repository'

export class ListGroupsUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly stageRepository: StageRepository,
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(request: { championshipId: string; stageId: string }): Promise<{ groups: Group[] }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const stage = await this.stageRepository.findById(request.stageId)

    if (!stage || stage.championshipId !== request.championshipId) {
      throw errorMessage.stageNotFound
    }

    const groups = await this.groupRepository.findByStageId(request.stageId)

    return { groups }
  }
}
