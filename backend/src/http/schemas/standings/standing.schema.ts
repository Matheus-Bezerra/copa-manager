import { z } from '@/lib/zod'

export const matchResultSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  homeScore: z.number().int(),
  awayScore: z.number().int(),
  homePenaltyScore: z.number().int().nullable(),
  awayPenaltyScore: z.number().int().nullable(),
  createdAt: z.coerce.date(),
})

export const standingEntrySchema = z.object({
  teamId: z.string(),
  position: z.number().int(),
  points: z.number().int(),
  wins: z.number().int(),
  draws: z.number().int(),
  losses: z.number().int(),
  goalsScored: z.number().int(),
  goalsConceded: z.number().int(),
  goalDifference: z.number().int(),
})
