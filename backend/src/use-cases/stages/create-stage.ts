import { ulid } from 'ulidx'
import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { Stage, StageFormat, StageRepository, StageType } from '@/repositories/stage-repository'

export interface CreateStageUseCaseRequest {
  championshipId: string
  name: string
  type: StageType
  format?: StageFormat | null
  teamsToAdvance?: number
  qualifiedTeams?: number | null
  thirdPlaceMatch?: boolean
}

export class CreateStageUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly stageRepository: StageRepository,
  ) {}

  async execute(request: CreateStageUseCaseRequest): Promise<{ stage: Stage }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    if (request.type === 'GROUP_STAGE' && !request.format) {
      throw errorMessage.stageInvalidFormat
    }

    if (request.type === 'KNOCKOUT' && request.format) {
      throw errorMessage.stageInvalidFormat
    }

    if (request.type === 'KNOCKOUT') {
      const q = request.qualifiedTeams
      if (!q || q <= 0 || (q & (q - 1)) !== 0) {
        throw errorMessage.stageInvalidQualifiedTeams
      }
    }

    const maxOrder = await this.stageRepository.findMaxDisplayOrder(request.championshipId)

    const stage = await this.stageRepository.create({
      id: ulid(),
      championshipId: request.championshipId,
      name: request.name,
      type: request.type,
      format: request.format ?? null,
      teamsToAdvance: request.teamsToAdvance ?? 1,
      qualifiedTeams: request.qualifiedTeams ?? null,
      thirdPlaceMatch: request.thirdPlaceMatch ?? false,
      displayOrder: maxOrder + 1,
    })

    return { stage }
  }
}
