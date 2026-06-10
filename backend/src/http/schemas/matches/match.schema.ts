import { z } from '@/lib/zod'

export const matchStatusSchema = z.enum(['SCHEDULED', 'IN_PROGRESS', 'FINISHED', 'CANCELLED'])

export const matchSchema = z.object({
  id: z.string(),
  championshipId: z.string(),
  roundId: z.string(),
  groupId: z.string().nullable(),
  homeTeamId: z.string().nullable(),
  awayTeamId: z.string().nullable(),
  scheduledAt: z.coerce.date().nullable(),
  status: matchStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const matchParamsSchema = z.object({
  championshipId: z.string().min(1),
  matchId: z.string().min(1),
})

export const championshipIdParamsSchema = z.object({
  championshipId: z.string().min(1),
})
