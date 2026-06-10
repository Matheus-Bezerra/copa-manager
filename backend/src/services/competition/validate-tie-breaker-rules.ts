import { normalizeTieBreakerCriterion } from '@/services/competition/tie-breaker'
import { errorMessage } from '@/constants/error-message'

export interface TieBreakerRuleInput {
  position: number
  criterion: string
}

export function validateTieBreakerRulesInput(rules: TieBreakerRuleInput[]): void {
  if (rules.length === 0) {
    throw errorMessage.tieBreakerRulesInvalid
  }

  const positions = rules.map((rule) => rule.position).sort((a, b) => a - b)

  if (new Set(positions).size !== positions.length) {
    throw errorMessage.tieBreakerDuplicatePosition
  }

  for (let index = 0; index < positions.length; index++) {
    if (positions[index] !== index + 1) {
      throw errorMessage.tieBreakerRulesInvalid
    }
  }

  for (const rule of rules) {
    if (!normalizeTieBreakerCriterion(rule.criterion)) {
      throw errorMessage.tieBreakerRulesInvalid
    }
  }
}
