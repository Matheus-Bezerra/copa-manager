import { ulid } from 'ulidx'
import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { Match, MatchRepository } from '@/repositories/match-repository'
import type { MatchResult, MatchResultRepository } from '@/repositories/match-result-repository'
import type { RoundRepository } from '@/repositories/round-repository'
import type { StageRepository } from '@/repositories/stage-repository'
import { RecalculateStandingsUseCase } from '@/use-cases/standings/recalculate-standings'
import type { ChampionshipRulesRepository } from '@/repositories/championship-rules-repository'
import type { GroupRepository } from '@/repositories/group-repository'
import type { StandingRepository } from '@/repositories/standing-repository'
import type { TieBreakerRuleRepository } from '@/repositories/tie-breaker-rule-repository'
import type { MatchBracketLinkRepository } from '@/repositories/match-bracket-link-repository'
import type { MatchEventRepository } from '@/repositories/match-event-repository'
import type { PlayerRepository } from '@/repositories/player-repository'
import type { PlayerStatisticsRepository } from '@/repositories/player-statistics-repository'
import { incrementMatchesPlayedOnMatchFinished } from '@/services/competition/increment-matches-played-on-match-finished'
import { ProcessMatchFinishedUseCase } from '@/use-cases/matches/process-match-finished'

export interface RegisterMatchResultUseCaseRequest {
  championshipId: string
  matchId: string
  homeScore: number
  awayScore: number
  homePenaltyScore?: number | null
  awayPenaltyScore?: number | null
}

export class RegisterMatchResultUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly matchRepository: MatchRepository,
    private readonly matchResultRepository: MatchResultRepository,
    private readonly roundRepository: RoundRepository,
    private readonly stageRepository: StageRepository,
    private readonly groupRepository: GroupRepository,
    private readonly standingRepository: StandingRepository,
    private readonly championshipRulesRepository: ChampionshipRulesRepository,
    private readonly tieBreakerRuleRepository: TieBreakerRuleRepository,
    private readonly matchBracketLinkRepository: MatchBracketLinkRepository,
    private readonly matchEventRepository: MatchEventRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly playerStatisticsRepository: PlayerStatisticsRepository,
  ) {}

  async execute(
    request: RegisterMatchResultUseCaseRequest,
  ): Promise<{ match: Match; result: MatchResult }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const match = await this.matchRepository.findById(request.matchId)

    if (!match || match.championshipId !== request.championshipId) {
      throw errorMessage.matchNotFound
    }

    if (match.status === 'CANCELLED') {
      throw errorMessage.matchCancelled
    }

    if (!match.homeTeamId || !match.awayTeamId) {
      throw errorMessage.matchTeamsRequired
    }

    if (request.homeScore < 0 || request.awayScore < 0) {
      throw errorMessage.matchInvalidScore
    }

    const existingResult = await this.matchResultRepository.findByMatchId(request.matchId)

    const result = await this.matchResultRepository.upsert({
      id: existingResult?.id ?? ulid(),
      matchId: request.matchId,
      homeScore: request.homeScore,
      awayScore: request.awayScore,
      homePenaltyScore: request.homePenaltyScore ?? null,
      awayPenaltyScore: request.awayPenaltyScore ?? null,
    })

    const isFirstFinish = match.status !== 'FINISHED'

    const updatedMatch = await this.matchRepository.update(request.matchId, { status: 'FINISHED' })

    if (isFirstFinish) {
      await incrementMatchesPlayedOnMatchFinished(
        updatedMatch,
        this.matchEventRepository,
        this.playerRepository,
        this.playerStatisticsRepository,
      )
    }

    const round = await this.roundRepository.findById(match.roundId)
    const stage = round ? await this.stageRepository.findById(round.stageId) : null

    if (match.groupId && stage?.type === 'GROUP_STAGE') {
      const recalculateStandingsUseCase = new RecalculateStandingsUseCase(
        this.stageRepository,
        this.groupRepository,
        this.matchRepository,
        this.standingRepository,
        this.championshipRulesRepository,
        this.tieBreakerRuleRepository,
      )

      await recalculateStandingsUseCase.execute({
        championshipId: request.championshipId,
        stageId: stage.id,
        groupId: match.groupId,
      })
    }

    const processMatchFinishedUseCase = new ProcessMatchFinishedUseCase(
      this.matchRepository,
      this.matchResultRepository,
      this.matchBracketLinkRepository,
      this.roundRepository,
      this.stageRepository,
      this.groupRepository,
      this.standingRepository,
    )

    await processMatchFinishedUseCase.execute({
      championshipId: request.championshipId,
      matchId: request.matchId,
    })

    return { match: updatedMatch, result }
  }
}
