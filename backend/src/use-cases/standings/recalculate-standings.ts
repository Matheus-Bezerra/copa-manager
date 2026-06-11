import { ulid } from 'ulidx'
import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRulesRepository } from '@/repositories/championship-rules-repository'
import type { GroupRepository } from '@/repositories/group-repository'
import type { MatchRepository } from '@/repositories/match-repository'
import type { StageRepository } from '@/repositories/stage-repository'
import type { Standing, StandingRepository } from '@/repositories/standing-repository'
import type { TieBreakerRuleRepository } from '@/repositories/tie-breaker-rule-repository'
import {
  calculateTeamStats,
  createEmptyStats,
} from '@/services/competition/standings-calculator'
import {
  assignPositions,
  sortStandings,
} from '@/services/competition/tie-breaker'
import {
  resolveScoringRules,
  resolveTieBreakerCriteria,
} from '@/services/competition/resolve-standings-config'

export interface RecalculateStandingsUseCaseRequest {
  championshipId: string
  stageId: string
  groupId: string
}

export class RecalculateStandingsUseCase {
  constructor(
    private readonly stageRepository: StageRepository,
    private readonly groupRepository: GroupRepository,
    private readonly matchRepository: MatchRepository,
    private readonly standingRepository: StandingRepository,
    private readonly championshipRulesRepository: ChampionshipRulesRepository,
    private readonly tieBreakerRuleRepository: TieBreakerRuleRepository,
  ) {}

  async syncIfNeeded(request: RecalculateStandingsUseCaseRequest): Promise<void> {
    const teamIds = await this.matchRepository.findTeamIdsByGroupId(request.groupId)

    if (teamIds.length === 0) {
      return
    }

    const existingStandings = await this.standingRepository.findByStageAndGroup(
      request.stageId,
      request.groupId,
    )

    const existingTeamIds = new Set(existingStandings.map((standing) => standing.teamId))
    const needsSync = teamIds.some((teamId) => !existingTeamIds.has(teamId))

    if (needsSync) {
      await this.execute(request)
    }
  }

  async execute(request: RecalculateStandingsUseCaseRequest): Promise<{ standings: Standing[] }> {
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

    const matches = await this.matchRepository.findFinishedWithResultsByGroupId(request.groupId)
    const teamIds = await this.matchRepository.findTeamIdsByGroupId(request.groupId)

    const rules = await this.championshipRulesRepository.findByChampionshipId(request.championshipId)
    const scoringRules = resolveScoringRules(rules)

    const tieBreakerRules = await this.tieBreakerRuleRepository.findByChampionshipId(
      request.championshipId,
    )

    const criteria = resolveTieBreakerCriteria(tieBreakerRules)

    const teamStats = calculateTeamStats(matches, scoringRules)

    for (const teamId of teamIds) {
      if (!teamStats.some((entry) => entry.teamId === teamId)) {
        teamStats.push(createEmptyStats(teamId))
      }
    }

    const sortedStats = sortStandings(teamStats, criteria, matches)
    const rankedStats = assignPositions(sortedStats)

    await this.standingRepository.deleteByGroupId(request.groupId)

    const standings: Standing[] = []

    for (const entry of rankedStats) {
      const standing = await this.standingRepository.upsert({
        id: ulid(),
        championshipId: request.championshipId,
        stageId: request.stageId,
        groupId: request.groupId,
        teamId: entry.teamId,
        position: entry.position,
        points: entry.points,
        wins: entry.wins,
        draws: entry.draws,
        losses: entry.losses,
        goalsScored: entry.goalsScored,
        goalsConceded: entry.goalsConceded,
        goalDifference: entry.goalDifference,
      })

      standings.push(standing)
    }

    return { standings }
  }
}
