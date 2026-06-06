import { ulid } from 'ulidx';
import { prisma } from '@/lib/prisma';
import type {
  CreatePlayerInput,
  Player,
  PlayerRepository,
  UpdatePlayerInput,
} from '@/repositories/player-repository';

const playerInclude = {
  statistics: true,
} as const;

export class PrismaPlayerRepository implements PlayerRepository {
  async findById(id: string): Promise<Player | null> {
    return prisma.player.findUnique({
      where: { id },
      include: playerInclude,
    });
  }

  async findByChampionshipId(championshipId: string): Promise<Player[]> {
    return prisma.player.findMany({
      where: {
        team: {
          championshipId,
        },
      },
      include: playerInclude,
      orderBy: { name: 'asc' },
    });
  }

  async create(data: CreatePlayerInput): Promise<Player> {
    const statisticsId = ulid();

    return prisma.player.create({
      data: {
        id: data.id,
        teamId: data.teamId,
        name: data.name,
        shirtNumber: data.shirtNumber ?? null,
        statistics: {
          create: {
            id: statisticsId,
            matchesPlayed: data.statistics?.matchesPlayed ?? 0,
            goals: data.statistics?.goals ?? 0,
            assists: data.statistics?.assists ?? 0,
            yellowCards: data.statistics?.yellowCards ?? 0,
            redCards: data.statistics?.redCards ?? 0,
            matchMvps: data.statistics?.matchMvps ?? 0,
          },
        },
      },
      include: playerInclude,
    });
  }

  async update(id: string, data: UpdatePlayerInput): Promise<Player> {
    const { statistics, ...playerData } = data;

    return prisma.player.update({
      where: { id },
      data: {
        ...playerData,
        ...(statistics
          ? {
            statistics: {
              upsert: {
                create: {
                  id: ulid(),
                  matchesPlayed: statistics.matchesPlayed ?? 0,
                  goals: statistics.goals ?? 0,
                  assists: statistics.assists ?? 0,
                  yellowCards: statistics.yellowCards ?? 0,
                  redCards: statistics.redCards ?? 0,
                  matchMvps: statistics.matchMvps ?? 0,
                },
                update: statistics,
              },
            },
          }
          : {}),
      },
      include: playerInclude,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.player.delete({ where: { id } });
  }
}
