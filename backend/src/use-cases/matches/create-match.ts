import { ulid } from 'ulidx'
import { errorMessage } from '@/constants/error-message'
import type { GroupRepository } from '@/repositories/group-repository'
import type { Match, MatchRepository } from '@/repositories/match-repository'
import type { RoundRepository } from '@/repositories/round-repository'
import type { StageRepository } from '@/repositories/stage-repository'
import type { TeamRepository } from '@/repositories/team-repository'
import type { ChampionshipRepository } from '@/repositories/championship-repository'

export interface CreateMatchUseCaseRequest {
  championshipId: string
  roundId: string
  groupId?: string | null
  homeTeamId?: string | null
  awayTeamId?: string | null
  scheduledAt?: Date | null
}

export class CreateMatchUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly roundRepository: RoundRepository,
    private readonly stageRepository: StageRepository,
    private readonly groupRepository: GroupRepository,
    private readonly teamRepository: TeamRepository,
    private readonly matchRepository: MatchRepository,
  ) {}

  async execute(request: CreateMatchUseCaseRequest): Promise<{ match: Match }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const round = await this.roundRepository.findById(request.roundId)

    if (!round) {
      throw errorMessage.roundNotFound
    }

    const stage = await this.stageRepository.findById(round.stageId)

    if (!stage || stage.championshipId !== request.championshipId) {
      throw errorMessage.stageNotFound
    }

    if (stage.type === 'GROUP_STAGE') {
      if (!request.groupId) {
        throw errorMessage.matchGroupRequired
      }

      const group = await this.groupRepository.findById(request.groupId)

      if (!group || group.stageId !== stage.id) {
        throw errorMessage.groupNotFound
      }
    }

    if (request.homeTeamId) {
      const homeTeam = await this.teamRepository.findById(request.homeTeamId)

      if (!homeTeam || homeTeam.championshipId !== request.championshipId) {
        throw errorMessage.teamNotFound
      }
    }

    if (request.awayTeamId) {
      const awayTeam = await this.teamRepository.findById(request.awayTeamId)

      if (!awayTeam || awayTeam.championshipId !== request.championshipId) {
        throw errorMessage.teamNotFound
      }
    }

    if (
      request.homeTeamId &&
      request.awayTeamId &&
      request.homeTeamId === request.awayTeamId
    ) {
      throw errorMessage.matchSameTeam
    }

    const match = await this.matchRepository.create({
      id: ulid(),
      championshipId: request.championshipId,
      roundId: request.roundId,
      groupId: request.groupId ?? null,
      homeTeamId: request.homeTeamId ?? null,
      awayTeamId: request.awayTeamId ?? null,
      scheduledAt: request.scheduledAt ?? null,
      status: 'SCHEDULED',
    })

    return { match }
  }
}
