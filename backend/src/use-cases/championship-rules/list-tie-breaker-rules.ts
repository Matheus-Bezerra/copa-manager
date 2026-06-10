import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { TieBreakerRuleRepository } from '@/repositories/tie-breaker-rule-repository'
import { toTieBreakerRulesResponse } from '@/services/competition/resolve-standings-config'

export class ListTieBreakerRulesUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly tieBreakerRuleRepository: TieBreakerRuleRepository,
  ) {}

  async execute(request: { championshipId: string }) {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const rules = await this.tieBreakerRuleRepository.findByChampionshipId(request.championshipId)

    return { rules: toTieBreakerRulesResponse(rules) }
  }
}
