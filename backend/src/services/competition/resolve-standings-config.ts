import type { ChampionshipRules } from '@/repositories/championship-rules-repository'
import type { TieBreakerRule } from '@/repositories/tie-breaker-rule-repository'
import {
  DEFAULT_SCORING_RULES,
  type ScoringRules,
} from '@/services/competition/standings-calculator'
import {
  DEFAULT_TIE_BREAKER_CRITERIA,
  normalizeTieBreakerCriterion,
  type TieBreakerCriterion,
} from '@/services/competition/tie-breaker'

export const DEFAULT_CHAMPIONSHIP_RULES = {
  winPoints: 3,
  drawPoints: 1,
  penaltyBonusPoints: 0,
  yellowCardsForSuspension: 3,
  redCardSuspensionGames: 1,
} as const

export const DEFAULT_TIE_BREAKER_RULE_DEFINITIONS = [
  { position: 1, criterion: 'Wins' },
  { position: 2, criterion: 'GoalDifference' },
  { position: 3, criterion: 'GoalsScored' },
  { position: 4, criterion: 'HeadToHead' },
] as const

export function resolveScoringRules(rules: ChampionshipRules | null): ScoringRules {
  return {
    winPoints: rules?.winPoints ?? DEFAULT_SCORING_RULES.winPoints,
    drawPoints: rules?.drawPoints ?? DEFAULT_SCORING_RULES.drawPoints,
    penaltyBonusPoints: rules?.penaltyBonusPoints ?? DEFAULT_SCORING_RULES.penaltyBonusPoints,
  }
}

export function resolveTieBreakerCriteria(
  tieBreakerRules: TieBreakerRule[],
): TieBreakerCriterion[] {
  if (tieBreakerRules.length === 0) {
    return DEFAULT_TIE_BREAKER_CRITERIA
  }

  const criteria = tieBreakerRules
    .sort((a, b) => a.position - b.position)
    .map((rule) => normalizeTieBreakerCriterion(rule.criterion))
    .filter((criterion): criterion is TieBreakerCriterion => criterion !== null)

  return criteria.length > 0 ? criteria : DEFAULT_TIE_BREAKER_CRITERIA
}

export function toChampionshipRulesResponse(rules: ChampionshipRules | null) {
  return {
    winPoints: rules?.winPoints ?? DEFAULT_CHAMPIONSHIP_RULES.winPoints,
    drawPoints: rules?.drawPoints ?? DEFAULT_CHAMPIONSHIP_RULES.drawPoints,
    penaltyBonusPoints: rules?.penaltyBonusPoints ?? DEFAULT_CHAMPIONSHIP_RULES.penaltyBonusPoints,
    yellowCardsForSuspension:
      rules?.yellowCardsForSuspension ?? DEFAULT_CHAMPIONSHIP_RULES.yellowCardsForSuspension,
    redCardSuspensionGames:
      rules?.redCardSuspensionGames ?? DEFAULT_CHAMPIONSHIP_RULES.redCardSuspensionGames,
    createdAt: rules?.createdAt ?? null,
    updatedAt: rules?.updatedAt ?? null,
  }
}

export function toTieBreakerRulesResponse(tieBreakerRules: TieBreakerRule[]) {
  if (tieBreakerRules.length === 0) {
    return DEFAULT_TIE_BREAKER_RULE_DEFINITIONS.map((rule) => ({ ...rule }))
  }

  return tieBreakerRules
    .sort((a, b) => a.position - b.position)
    .map((rule) => ({
      id: rule.id,
      position: rule.position,
      criterion: rule.criterion,
    }))
}
