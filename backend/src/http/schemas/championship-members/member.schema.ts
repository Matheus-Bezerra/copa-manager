import { z } from '@/lib/zod';

export const championshipRoleSchema = z.enum(['OWNER', 'ADMINISTRATOR', 'ORGANIZER']);

export const memberSchema = z.object({
  id: z.string(),
  championshipId: z.string(),
  userId: z.string(),
  role: championshipRoleSchema,
  createdAt: z.coerce.date(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatarUrl: z.string().nullable(),
  }),
});

export const invitationSchema = z.object({
  id: z.string(),
  championshipId: z.string(),
  email: z.string(),
  role: championshipRoleSchema,
  token: z.string(),
  status: z.enum(['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED']),
  expiresAt: z.coerce.date(),
  acceptedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});
