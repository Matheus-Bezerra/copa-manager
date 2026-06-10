import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { ChampionshipRulesRepository } from '@/repositories/championship-rules-repository'
import { toChampionshipRulesResponse } from '@/services/competition/resolve-standings-config'

export class GetChampionshipRulesUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly championshipRulesRepository: ChampionshipRulesRepository,
  ) {}

  async execute(request: { championshipId: string }) {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const rules = await this.championshipRulesRepository.findByChampionshipId(request.championshipId)

    return { rules: toChampionshipRulesResponse(rules) }
  }
}
