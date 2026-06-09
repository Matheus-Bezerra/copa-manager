import { prisma } from '@/lib/prisma'
import type {
  Standing,
  StandingRepository,
  UpsertStandingInput,
} from '@/repositories/standing-repository'

export class PrismaStandingRepository implements StandingRepository {
  async findByGroupId(groupId: string): Promise<Standing[]> {
    return prisma.standing.findMany({
      where: { groupId },
      orderBy: { position: 'asc' },
    })
  }

  async findByStageAndGroup(stageId: string, groupId: string): Promise<Standing[]> {
    return prisma.standing.findMany({
      where: { stageId, groupId },
      orderBy: { position: 'asc' },
    })
  }

  async findByTeamAndGroup(teamId: string, groupId: string): Promise<Standing | null> {
    return prisma.standing.findFirst({
      where: { teamId, groupId },
    })
  }

  async upsert(data: UpsertStandingInput): Promise<Standing> {
    return prisma.standing.upsert({
      where: { stageId_groupId_teamId: { stageId: data.stageId, groupId: data.groupId, teamId: data.teamId } },
      create: {
        id: data.id,
        championshipId: data.championshipId,
        stageId: data.stageId,
        groupId: data.groupId,
        teamId: data.teamId,
        position: data.position ?? 0,
        points: data.points ?? 0,
        wins: data.wins ?? 0,
        draws: data.draws ?? 0,
        losses: data.losses ?? 0,
        goalsScored: data.goalsScored ?? 0,
        goalsConceded: data.goalsConceded ?? 0,
        goalDifference: data.goalDifference ?? 0,
      },
      update: {
        position: data.position,
        points: data.points,
        wins: data.wins,
        draws: data.draws,
        losses: data.losses,
        goalsScored: data.goalsScored,
        goalsConceded: data.goalsConceded,
        goalDifference: data.goalDifference,
      },
    })
  }

  async deleteByGroupId(groupId: string): Promise<void> {
    await prisma.standing.deleteMany({ where: { groupId } })
  }
}
