import type { Player } from '@prisma/client';
import { ulid } from 'ulidx';
import { SEED_PLAYERS } from './constants/seed-data';
import { prisma } from './prisma';

export async function createPlayers(): Promise<Player[]> {
  const players = await Promise.all(
    SEED_PLAYERS.map(async (player) => {
      const created = await prisma.player.upsert({
        where: { id: player.id },
        create: {
          id: player.id,
          teamId: player.teamId,
          name: player.name,
          shirtNumber: player.shirtNumber,
          statistics: {
            create: {
              id: ulid(),
              matchesPlayed: player.statistics.matchesPlayed,
              goals: player.statistics.goals,
              assists: player.statistics.assists,
              yellowCards: player.statistics.yellowCards,
              redCards: player.statistics.redCards,
              matchMvps: player.statistics.matchMvps,
            },
          },
        },
        update: {
          teamId: player.teamId,
          name: player.name,
          shirtNumber: player.shirtNumber,
        },
        include: { statistics: true },
      });

      if (created.statistics) {
        await prisma.playerStatistics.update({
          where: { playerId: created.id },
          data: player.statistics,
        });
      } else {
        await prisma.playerStatistics.create({
          data: {
            id: ulid(),
            playerId: created.id,
            ...player.statistics,
          },
        });
      }

      return prisma.player.findUniqueOrThrow({
        where: { id: player.id },
      });
    })
  );

  return players;
}
