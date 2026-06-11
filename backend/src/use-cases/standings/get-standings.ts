import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { ChampionshipRulesRepository } from '@/repositories/championship-rules-repository'
import type { GroupRepository } from '@/repositories/group-repository'
import type { MatchRepository } from '@/repositories/match-repository'
import type { StageRepository } from '@/repositories/stage-repository'
import type { Standing, StandingRepository } from '@/repositories/standing-repository'
import type { TieBreakerRuleRepository } from '@/repositories/tie-breaker-rule-repository'
import { syncGroupStandingsIfNeeded } from '@/services/competition/sync-group-standings'

export interface GetStandingsUseCaseRequest {
  championshipId: string
  stageId: string
  groupId: string
}

export interface StandingEntry {
  teamId: string
  position: number
  points: number
  wins: number
  draws: number
  losses: number
  goalsScored: number
  goalsConceded: number
  goalDifference: number
}

export class GetStandingsUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly stageRepository: StageRepository,
    private readonly groupRepository: GroupRepository,
    private readonly matchRepository: MatchRepository,
    private readonly standingRepository: StandingRepository,
    private readonly championshipRulesRepository: ChampionshipRulesRepository,
    private readonly tieBreakerRuleRepository: TieBreakerRuleRepository,
  ) {}

  async execute(request: GetStandingsUseCaseRequest): Promise<{ standings: StandingEntry[] }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const stage = await this.stageRepository.findById(request.stageId)

    if (!stage || stage.championshipId !== request.championshipId) {
      throw errorMessage.stageNotFound
    }

    if (stage.type !== 'GROUP_STAGE') {
      throw errorMessage.standingGroupStageOnly
    }

    const group = await this.groupRepository.findById(request.groupId)

    if (!group || group.stageId !== request.stageId) {
      throw errorMessage.groupNotFound
    }

    await syncGroupStandingsIfNeeded(
      {
        stageRepository: this.stageRepository,
        groupRepository: this.groupRepository,
        matchRepository: this.matchRepository,
        standingRepository: this.standingRepository,
        championshipRulesRepository: this.championshipRulesRepository,
        tieBreakerRuleRepository: this.tieBreakerRuleRepository,
      },
      {
        championshipId: request.championshipId,
        stageId: request.stageId,
        groupId: request.groupId,
      },
    )

    const standings = await this.standingRepository.findByStageAndGroup(
      request.stageId,
      request.groupId,
    )

    return {
      standings: standings.map(toStandingEntry),
    }
  }
}

function toStandingEntry(standing: Standing): StandingEntry {
  return {
    teamId: standing.teamId,
    position: standing.position,
    points: standing.points,
    wins: standing.wins,
    draws: standing.draws,
    losses: standing.losses,
    goalsScored: standing.goalsScored,
    goalsConceded: standing.goalsConceded,
    goalDifference: standing.goalDifference,
  }
}
