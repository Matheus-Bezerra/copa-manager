import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { Round, RoundRepository } from '@/repositories/round-repository'
import type { StageRepository } from '@/repositories/stage-repository'

export class ListRoundsUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly stageRepository: StageRepository,
    private readonly roundRepository: RoundRepository,
  ) {}

  async execute(request: { championshipId: string; stageId: string }): Promise<{ rounds: Round[] }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const stage = await this.stageRepository.findById(request.stageId)

    if (!stage || stage.championshipId !== request.championshipId) {
      throw errorMessage.stageNotFound
    }

    const rounds = await this.roundRepository.findByStageId(request.stageId)

    return { rounds }
  }
}
