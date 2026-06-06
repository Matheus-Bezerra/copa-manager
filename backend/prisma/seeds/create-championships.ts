import type { Championship, User } from '@prisma/client';
import { ulid } from 'ulidx';
import { SEED_CHAMPIONSHIP, SEED_USERS } from './constants/seed-data';
import { prisma } from './prisma';

export async function createChampionships(users: Record<keyof typeof SEED_USERS, User>): Promise<{
  championship: Championship;
}> {
  const championship = await prisma.championship.upsert({
    where: { slug: SEED_CHAMPIONSHIP.slug },
    create: {
      id: SEED_CHAMPIONSHIP.id,
      ownerUserId: users.owner.id,
      name: SEED_CHAMPIONSHIP.name,
      slug: SEED_CHAMPIONSHIP.slug,
      description: SEED_CHAMPIONSHIP.description,
      startDate: SEED_CHAMPIONSHIP.startDate,
      endDate: SEED_CHAMPIONSHIP.endDate,
      status: SEED_CHAMPIONSHIP.status,
    },
    update: {
      name: SEED_CHAMPIONSHIP.name,
      description: SEED_CHAMPIONSHIP.description,
      startDate: SEED_CHAMPIONSHIP.startDate,
      endDate: SEED_CHAMPIONSHIP.endDate,
      status: SEED_CHAMPIONSHIP.status,
    },
  });

  const members = [
    { userId: users.owner.id, role: 'OWNER' as const },
    { userId: users.admin.id, role: 'ADMINISTRATOR' as const },
    { userId: users.organizer.id, role: 'ORGANIZER' as const },
  ];

  await Promise.all(
    members.map((member) =>
      prisma.championshipMember.upsert({
        where: {
          championshipId_userId: {
            championshipId: championship.id,
            userId: member.userId,
          },
        },
        create: {
          id: ulid(),
          championshipId: championship.id,
          userId: member.userId,
          role: member.role,
        },
        update: {
          role: member.role,
        },
      })
    )
  );

  return { championship };
}
