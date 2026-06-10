import { ulid } from 'ulidx'
import { errorMessage } from '@/constants/error-message'
import type { CompetitionSetupRepository, SetupStageResult } from '@/repositories/competition-setup-repository'
import type { ChampionshipRepository } from '@/repositories/championship-repository'
import type { StageFormat, StageType } from '@/repositories/stage-repository'
import { calculateGroupStageRounds } from '@/services/competition/calculate-group-stage-rounds'
import { calculateKnockoutRounds } from '@/services/competition/calculate-knockout-rounds'
import { generateKnockoutBracket } from '@/services/competition/generate-knockout-bracket'
import { validateSetupPayload } from '@/services/competition/validate-setup-payload'

export interface StageGroupInput {
  name: string
  teams: number
}

export interface StageSetupInput {
  name: string
  type: StageType
  order: number
  format?: StageFormat | null
  teamsToAdvance?: number
  qualifiedTeams?: number
  thirdPlaceMatch?: boolean
  groups?: StageGroupInput[]
}

export interface SetupStagesUseCaseRequest {
  championshipId: string
  stages: StageSetupInput[]
}

export class SetupStagesUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly competitionSetupRepository: CompetitionSetupRepository,
  ) {}

  async execute(request: SetupStagesUseCaseRequest): Promise<{ stages: SetupStageResult[] }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    validateSetupPayload(
      request.stages.map((s) => ({
        name: s.name,
        type: s.type,
        order: s.order,
        format: s.format,
        qualifiedTeams: s.qualifiedTeams,
        groups: s.groups,
      })),
    )

    const stageDatas = request.stages.map((stageInput) => {
      const stageId = ulid()

      const groups = (stageInput.groups ?? []).map((g, idx) => ({
        id: ulid(),
        name: g.name,
        displayOrder: idx + 1,
      }))

      const rounds: Array<{ id: string; number: number; name: string | null }> = []
      const matches: Array<{ id: string; roundId: string }> = []
      const bracketLinks: Array<{
        id: string
        fromMatchId: string
        toMatchId: string
        outcome: 'WINNER' | 'LOSER'
        toSlot: 'HOME' | 'AWAY'
      }> = []

      if (stageInput.type === 'GROUP_STAGE') {
        const maxTeams = Math.max(...(stageInput.groups ?? []).map((g) => g.teams))
        const roundCount = calculateGroupStageRounds(stageInput.format!, maxTeams)

        for (let i = 1; i <= roundCount; i++) {
          rounds.push({ id: ulid(), number: i, name: `Rodada ${i}` })
        }
      } else {
        const qualified = stageInput.qualifiedTeams!
        const hasThirdPlace = stageInput.thirdPlaceMatch ?? false
        const roundDefs = calculateKnockoutRounds(qualified, hasThirdPlace)

        const roundsWithIds = roundDefs.map((r) => ({ ...r, id: ulid() }))
        rounds.push(...roundsWithIds.map((r) => ({ id: r.id, number: r.number, name: r.name })))

        const bracketResult = generateKnockoutBracket(
          roundsWithIds,
          qualified,
          hasThirdPlace,
          request.championshipId,
          () => ulid(),
        )

        matches.push(...bracketResult.matches)
        bracketLinks.push(...bracketResult.bracketLinks)
      }

      return {
        id: stageId,
        name: stageInput.name,
        type: stageInput.type,
        format: stageInput.format ?? null,
        teamsToAdvance: stageInput.teamsToAdvance ?? 1,
        qualifiedTeams: stageInput.qualifiedTeams ?? null,
        thirdPlaceMatch: stageInput.thirdPlaceMatch ?? false,
        displayOrder: stageInput.order,
        groups,
        rounds,
        matches,
        bracketLinks,
      }
    })

    const stages = await this.competitionSetupRepository.setup({
      championshipId: request.championshipId,
      stages: stageDatas,
    })

    return { stages }
  }
}
