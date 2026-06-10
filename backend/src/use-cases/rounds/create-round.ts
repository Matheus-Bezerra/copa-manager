import { ulid } from 'ulidx'
import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { Round, RoundRepository } from '@/repositories/round-repository'
import type { StageRepository } from '@/repositories/stage-repository'

export interface CreateRoundUseCaseRequest {
  championshipId: string
  stageId: string
  name?: string | null
}

export class CreateRoundUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly stageRepository: StageRepository,
    private readonly roundRepository: RoundRepository,
  ) {}

  async execute(request: CreateRoundUseCaseRequest): Promise<{ round: Round }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const stage = await this.stageRepository.findById(request.stageId)

    if (!stage || stage.championshipId !== request.championshipId) {
      throw errorMessage.stageNotFound
    }

    const maxNumber = await this.roundRepository.findMaxNumber(request.stageId)

    const round = await this.roundRepository.create({
      id: ulid(),
      stageId: request.stageId,
      number: maxNumber + 1,
      name: request.name ?? null,
    })

    return { round }
  }
}
