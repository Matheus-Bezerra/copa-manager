import type { Championship, Team } from '@prisma/client';
import { SEED_TEAMS } from './constants/seed-data';
import { prisma } from './prisma';

export async function createTeams(championship: Championship): Promise<Team[]> {
  const teams = await Promise.all(
    SEED_TEAMS.map((team) =>
      prisma.team.upsert({
        where: { id: team.id },
        create: {
          id: team.id,
          championshipId: championship.id,
          name: team.name,
          shortName: team.shortName,
          primaryColor: team.primaryColor,
          secondaryColor: team.secondaryColor,
        },
        update: {
          championshipId: championship.id,
          name: team.name,
          shortName: team.shortName,
          primaryColor: team.primaryColor,
          secondaryColor: team.secondaryColor,
        },
      })
    )
  );

  return teams;
}
