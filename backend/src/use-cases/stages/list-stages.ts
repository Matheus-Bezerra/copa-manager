import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { Stage, StageRepository } from '@/repositories/stage-repository'

export class ListStagesUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly stageRepository: StageRepository,
  ) {}

  async execute(request: { championshipId: string }): Promise<{ stages: Stage[] }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const stages = await this.stageRepository.findByChampionshipId(request.championshipId)

    return { stages }
  }
}
