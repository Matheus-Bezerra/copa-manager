import { z } from '@/lib/zod';

export const publicUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  avatarUrl: z.string().nullable(),
});

export const currentUserResponseSchema = z.object({
  data: publicUserSchema,
});
