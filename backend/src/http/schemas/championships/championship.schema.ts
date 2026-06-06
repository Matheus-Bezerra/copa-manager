import { z } from '@/lib/zod';

export const championshipIdParamsSchema = z.object({
  championshipId: z.string().min(1),
});

export const championshipStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'FINISHED']);

export const championshipNameSchema = z.string().trim().min(1).max(100);

export const championshipDescriptionSchema = z.string().trim().max(500).optional().nullable();

export const championshipSchema = z.object({
  id: z.string(),
  ownerUserId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  regulations: z.string().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: championshipStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const publicChampionshipSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: championshipStatusSchema,
});

export const dateInputSchema = z.coerce.date();
