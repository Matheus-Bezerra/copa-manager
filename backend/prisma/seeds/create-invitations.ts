import type { Championship } from '@prisma/client';
import { SEED_INVITATION } from './constants/seed-data';
import { prisma } from './prisma';

export async function createInvitations(championship: Championship): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.invitation.upsert({
    where: { token: SEED_INVITATION.token },
    create: {
      id: SEED_INVITATION.id,
      championshipId: championship.id,
      email: SEED_INVITATION.email,
      role: SEED_INVITATION.role,
      token: SEED_INVITATION.token,
      status: 'PENDING',
      expiresAt,
    },
    update: {
      championshipId: championship.id,
      email: SEED_INVITATION.email,
      role: SEED_INVITATION.role,
      status: 'PENDING',
      expiresAt,
      acceptedAt: null,
    },
  });
}
