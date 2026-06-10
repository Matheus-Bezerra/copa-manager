import { ulid } from 'ulidx'
import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { TieBreakerRuleRepository } from '@/repositories/tie-breaker-rule-repository'
import { toTieBreakerRulesResponse } from '@/services/competition/resolve-standings-config'
import { validateTieBreakerRulesInput } from '@/services/competition/validate-tie-breaker-rules'

export interface TieBreakerRuleUpdateInput {
  position: number
  criterion: string
}

export interface UpdateTieBreakerRulesUseCaseRequest {
  championshipId: string
  rules: TieBreakerRuleUpdateInput[]
}

export class UpdateTieBreakerRulesUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly tieBreakerRuleRepository: TieBreakerRuleRepository,
  ) {}

  async execute(request: UpdateTieBreakerRulesUseCaseRequest) {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    validateTieBreakerRulesInput(request.rules)

    const rules = await this.tieBreakerRuleRepository.replaceByChampionshipId(
      request.championshipId,
      request.rules.map((rule) => ({
        id: ulid(),
        position: rule.position,
        criterion: rule.criterion,
      })),
    )

    return { rules: toTieBreakerRulesResponse(rules) }
  }
}
