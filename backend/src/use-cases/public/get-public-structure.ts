import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { GroupRepository } from '@/repositories/group-repository'
import type { RoundRepository } from '@/repositories/round-repository'
import type { StageRepository } from '@/repositories/stage-repository'
import type { StageWithStructure } from '@/use-cases/stages/get-championship-structure'

export class GetPublicStructureUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly stageRepository: StageRepository,
    private readonly groupRepository: GroupRepository,
    private readonly roundRepository: RoundRepository,
  ) {}

  async execute(request: { slug: string }): Promise<{ stages: StageWithStructure[] }> {
    const championship = await this.championshipRepository.findBySlug(request.slug)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const stages = await this.stageRepository.findByChampionshipId(championship.id)

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
