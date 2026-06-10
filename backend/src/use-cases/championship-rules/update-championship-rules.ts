import { ulid } from 'ulidx'
import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { ChampionshipRulesRepository } from '@/repositories/championship-rules-repository'
import { toChampionshipRulesResponse } from '@/services/competition/resolve-standings-config'

export interface UpdateChampionshipRulesUseCaseRequest {
  championshipId: string
  winPoints?: number
  drawPoints?: number
  penaltyBonusPoints?: number
  yellowCardsForSuspension?: number
  redCardSuspensionGames?: number
}

export class UpdateChampionshipRulesUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly championshipRulesRepository: ChampionshipRulesRepository,
  ) {}

  async execute(request: UpdateChampionshipRulesUseCaseRequest) {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    if (
      (request.winPoints !== undefined && request.winPoints < 0) ||
      (request.drawPoints !== undefined && request.drawPoints < 0) ||
      (request.penaltyBonusPoints !== undefined && request.penaltyBonusPoints < 0) ||
      (request.yellowCardsForSuspension !== undefined && request.yellowCardsForSuspension < 1) ||
      (request.redCardSuspensionGames !== undefined && request.redCardSuspensionGames < 0)
    ) {
      throw errorMessage.championshipRulesInvalid
    }

    const existing = await this.championshipRulesRepository.findByChampionshipId(
      request.championshipId,
    )

    const rules = await this.championshipRulesRepository.upsert({
      id: existing?.id ?? ulid(),
      championshipId: request.championshipId,
      winPoints: request.winPoints,
      drawPoints: request.drawPoints,
      penaltyBonusPoints: request.penaltyBonusPoints,
      yellowCardsForSuspension: request.yellowCardsForSuspension,
      redCardSuspensionGames: request.redCardSuspensionGames,
    })

    return { rules: toChampionshipRulesResponse(rules) }
  }
}
