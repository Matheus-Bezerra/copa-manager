import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { GroupRepository } from '@/repositories/group-repository'
import type { RoundRepository } from '@/repositories/round-repository'
import type { Stage, StageRepository } from '@/repositories/stage-repository'
import type { Group } from '@/repositories/group-repository'
import type { Round } from '@/repositories/round-repository'

export interface StageWithStructure extends Stage {
  groups: Group[]
  rounds: Round[]
}

export class GetChampionshipStructureUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly stageRepository: StageRepository,
    private readonly groupRepository: GroupRepository,
    private readonly roundRepository: RoundRepository,
  ) {}

  async execute(request: { championshipId: string }): Promise<{ stages: StageWithStructure[] }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const stages = await this.stageRepository.findByChampionshipId(request.championshipId)

    const stagesWithStructure = await Promise.all(
      stages.map(async (stage) => {
        const [groups, rounds] = await Promise.all([
          this.groupRepository.findByStageId(stage.id),
          this.roundRepository.findByStageId(stage.id),
        ])

        return { ...stage, groups, rounds }
      }),
    )

    return { stages: stagesWithStructure }
  }
}
