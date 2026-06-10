import { prisma } from '@/lib/prisma'
import type {
  CompetitionSetupRepository,
  SetupStageResult,
  SetupStagesInput,
} from '@/repositories/competition-setup-repository'

export class PrismaCompetitionSetupRepository implements CompetitionSetupRepository {
  async setup(data: SetupStagesInput): Promise<SetupStageResult[]> {
    const results = await prisma.$transaction(async (tx) => {
      await tx.stage.deleteMany({ where: { championshipId: data.championshipId } })

      const createdStages: SetupStageResult[] = []

      for (const stageData of data.stages) {
        const stage = await tx.stage.create({
          data: {
            id: stageData.id,
            championshipId: data.championshipId,
            name: stageData.name,
            type: stageData.type,
            format: stageData.format ?? null,
            teamsToAdvance: stageData.teamsToAdvance,
            qualifiedTeams: stageData.qualifiedTeams ?? null,
            thirdPlaceMatch: stageData.thirdPlaceMatch,
            displayOrder: stageData.displayOrder,
          },
        })

        const groups = []
        for (const groupData of stageData.groups) {
          const group = await tx.group.create({
            data: {
              id: groupData.id,
              stageId: stage.id,
              name: groupData.name,
              displayOrder: groupData.displayOrder,
            },
          })
          groups.push(group)
        }

        const rounds = []
        for (const roundData of stageData.rounds) {
          const round = await tx.round.create({
            data: {
              id: roundData.id,
              stageId: stage.id,
              number: roundData.number,
              name: roundData.name ?? null,
            },
          })
          rounds.push(round)
        }

        for (const matchData of stageData.matches) {
          await tx.match.create({
            data: {
              id: matchData.id,
              championshipId: data.championshipId,
              roundId: matchData.roundId,
              status: 'SCHEDULED',
            },
          })
        }

        for (const linkData of stageData.bracketLinks) {
          await tx.matchBracketLink.create({
            data: {
              id: linkData.id,
              fromMatchId: linkData.fromMatchId,
              toMatchId: linkData.toMatchId,
              outcome: linkData.outcome,
              toSlot: linkData.toSlot,
            },
          })
        }

        createdStages.push({
          ...stage,
          groups,
          rounds,
        })
      }

      return createdStages
    })

    return results
  }
}
