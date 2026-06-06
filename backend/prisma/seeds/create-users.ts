import bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';
import { SEED_PASSWORD, SEED_USERS } from './constants/seed-data';
import { prisma } from './prisma';

export async function createUsers(): Promise<Record<keyof typeof SEED_USERS, User>> {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const result = {} as Record<keyof typeof SEED_USERS, User>;

  for (const key of Object.keys(SEED_USERS) as (keyof typeof SEED_USERS)[]) {
    const user = SEED_USERS[key];

    result[key] = await prisma.user.upsert({
      where: { email: user.email },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash,
        status: 'ACTIVE',
      },
      update: {
        name: user.name,
        passwordHash,
        status: 'ACTIVE',
        deletedAt: null,
      },
    });
  }

  return result;
}
