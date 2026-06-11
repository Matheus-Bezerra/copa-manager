import type { ChampionshipRulesRepository } from '@/repositories/championship-rules-repository'
import type { GroupRepository } from '@/repositories/group-repository'
import type { MatchRepository } from '@/repositories/match-repository'
import type { StageRepository } from '@/repositories/stage-repository'
import type { StandingRepository } from '@/repositories/standing-repository'
import type { TieBreakerRuleRepository } from '@/repositories/tie-breaker-rule-repository'
import { RecalculateStandingsUseCase } from '@/use-cases/standings/recalculate-standings'

export interface SyncGroupStandingsRequest {
  championshipId: string
  stageId: string
  groupId: string
}

export async function syncGroupStandingsIfNeeded(
  deps: {
    stageRepository: StageRepository
    groupRepository: GroupRepository
    matchRepository: MatchRepository
    standingRepository: StandingRepository
    championshipRulesRepository: ChampionshipRulesRepository
    tieBreakerRuleRepository: TieBreakerRuleRepository
  },
  request: SyncGroupStandingsRequest,
): Promise<void> {
  const recalculateStandingsUseCase = new RecalculateStandingsUseCase(
    deps.stageRepository,
    deps.groupRepository,
    deps.matchRepository,
    deps.standingRepository,
    deps.championshipRulesRepository,
    deps.tieBreakerRuleRepository,
  )

  await recalculateStandingsUseCase.syncIfNeeded(request)
}
