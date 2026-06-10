import { errorMessage } from '@/constants/error-message'
import type { Match, MatchRepository } from '@/repositories/match-repository'
import type { MatchResultRepository } from '@/repositories/match-result-repository'
import type { MatchBracketLinkRepository } from '@/repositories/match-bracket-link-repository'
import type { RoundRepository } from '@/repositories/round-repository'
import type { StageRepository } from '@/repositories/stage-repository'
import type { GroupRepository } from '@/repositories/group-repository'
import type { StandingRepository } from '@/repositories/standing-repository'
import { advanceGroupStageClassified } from '@/services/competition/advance-group-stage-classified'
import { advanceLoserToThirdPlace } from '@/services/competition/advance-loser-to-third-place'
import { advanceWinnerInBracket } from '@/services/competition/advance-winner-in-bracket'
import { resolveMatchOutcome } from '@/services/competition/resolve-match-outcome'
import { revertBracketCascade } from '@/services/competition/revert-bracket-cascade'

export interface ProcessMatchFinishedUseCaseRequest {
  championshipId: string
  matchId: string
}

export class ProcessMatchFinishedUseCase {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly matchResultRepository: MatchResultRepository,
    private readonly matchBracketLinkRepository: MatchBracketLinkRepository,
    private readonly roundRepository: RoundRepository,
    private readonly stageRepository: StageRepository,
    private readonly groupRepository: GroupRepository,
    private readonly standingRepository: StandingRepository,
  ) {}

  async execute(request: ProcessMatchFinishedUseCaseRequest): Promise<void> {
    const match = await this.matchRepository.findById(request.matchId)

    if (!match || match.championshipId !== request.championshipId) {
      throw errorMessage.matchNotFound
    }

    const round = await this.roundRepository.findById(match.roundId)

    if (!round) {
      throw errorMessage.roundNotFound
    }

    const stage = await this.stageRepository.findById(round.stageId)

    if (!stage || stage.championshipId !== request.championshipId) {
      throw errorMessage.stageNotFound
    }

    if (stage.type === 'KNOCKOUT') {
      await this.processKnockoutMatch(match, round.number)
      return
    }

    if (stage.type === 'GROUP_STAGE') {
      await advanceGroupStageClassified(
        request.championshipId,
        stage,
        this.stageRepository,
        this.groupRepository,
        this.standingRepository,
        this.roundRepository,
        this.matchRepository,
        this.matchBracketLinkRepository,
      )
    }
  }

  private async processKnockoutMatch(match: Match, fromRoundNumber: number): Promise<void> {
    await revertBracketCascade(match.id, this.matchRepository, this.matchBracketLinkRepository)

    const round = await this.roundRepository.findById(match.roundId)

    if (!round) {
      return
    }

    const rounds = await this.roundRepository.findByStageId(round.stageId)
    const roundsFromCurrent = rounds
      .filter((entry) => entry.number >= fromRoundNumber)
      .sort((a, b) => a.number - b.number)

    for (const stageRound of roundsFromCurrent) {
      const roundMatches = await this.matchRepository.findByRoundId(stageRound.id)

      for (const roundMatch of roundMatches) {
        await this.applyKnockoutAdvancement(roundMatch)
      }
    }
  }

  private async applyKnockoutAdvancement(match: Match): Promise<void> {
    if (match.status !== 'FINISHED') {
      return
    }

    if (!match.homeTeamId || !match.awayTeamId) {
      return
    }

    const result = await this.matchResultRepository.findByMatchId(match.id)

    if (!result) {
      return
    }

    let outcome

    try {
      outcome = resolveMatchOutcome(
        { homeTeamId: match.homeTeamId, awayTeamId: match.awayTeamId },
        {
          homeScore: result.homeScore,
          awayScore: result.awayScore,
          homePenaltyScore: result.homePenaltyScore,
          awayPenaltyScore: result.awayPenaltyScore,
        },
      )
    } catch {
      throw errorMessage.matchKnockoutDrawRequiresPenalties
    }

    await advanceWinnerInBracket(
      match.id,
      outcome.winnerId,
      this.matchRepository,
      this.matchBracketLinkRepository,
    )

    await advanceLoserToThirdPlace(
      match.id,
      outcome.loserId,
      this.matchRepository,
      this.matchBracketLinkRepository,
    )
  }
}
