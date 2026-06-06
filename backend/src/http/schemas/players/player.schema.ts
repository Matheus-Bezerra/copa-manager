import { z } from '@/lib/zod';

const playerNameSchema = z.string().trim().min(1).max(100);

export const playerShirtNumberSchema = z.number().int().min(0).max(999);

export const playerStatisticsSchema = z.object({
  matchesPlayed: z.number().int().min(0),
  goals: z.number().int().min(0),
  assists: z.number().int().min(0),
  yellowCards: z.number().int().min(0),
  redCards: z.number().int().min(0),
  matchMvps: z.number().int().min(0),
});

export const playerStatisticsInputSchema = z.object({
  matchesPlayed: z.number().int().min(0).optional(),
  goals: z.number().int().min(0).optional(),
  assists: z.number().int().min(0).optional(),
  yellowCards: z.number().int().min(0).optional(),
  redCards: z.number().int().min(0).optional(),
  matchMvps: z.number().int().min(0).optional(),
});

export const playerSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  name: z.string(),
  shirtNumber: z.number().int().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  statistics: playerStatisticsSchema.nullable(),
});

export const publicPlayerSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  name: z.string(),
  shirtNumber: z.number().int().nullable(),
  statistics: playerStatisticsSchema.nullable(),
});

export const createPlayerBodySchema = z.object({
  teamId: z.string().min(1),
  name: playerNameSchema,
  shirtNumber: playerShirtNumberSchema.optional().nullable(),
  statistics: playerStatisticsInputSchema.optional(),
});

export const updatePlayerBodySchema = z.object({
  teamId: z.string().min(1).optional(),
  name: playerNameSchema.optional(),
  shirtNumber: playerShirtNumberSchema.optional().nullable(),
  statistics: playerStatisticsInputSchema.optional(),
});
