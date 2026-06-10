import { ulid } from 'ulidx'
import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { Group, GroupRepository } from '@/repositories/group-repository'
import type { StageRepository } from '@/repositories/stage-repository'

export interface CreateGroupUseCaseRequest {
  championshipId: string
  stageId: string
  name: string
}

export class CreateGroupUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly stageRepository: StageRepository,
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(request: CreateGroupUseCaseRequest): Promise<{ group: Group }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const stage = await this.stageRepository.findById(request.stageId)

    if (!stage || stage.championshipId !== request.championshipId) {
      throw errorMessage.stageNotFound
    }

    if (stage.type !== 'GROUP_STAGE') {
      throw errorMessage.stageInvalidFormat
    }

    const maxOrder = await this.groupRepository.findMaxDisplayOrder(request.stageId)

    const group = await this.groupRepository.create({
      id: ulid(),
      stageId: request.stageId,
      name: request.name,
      displayOrder: maxOrder + 1,
    })

    return { group }
  }
}
