import { z } from '@/lib/zod';
import { validateHexColor } from '@/utils/validators/validate-hex-color';

const teamNameSchema = z.string().trim().min(1).max(100);

const teamShortNameSchema = z.string().trim().min(1).max(3);

const hexColorInputSchema = z
  .string()
  .trim()
  .min(1)
  .refine(validateHexColor, {
    error: 'A cor deve estar no formato hexadecimal (#RRGGBB ou RRGGBB)',
  });

export const teamSchema = z.object({
  id: z.string(),
  championshipId: z.string(),
  name: z.string(),
  shortName: z.string().nullable(),
  logoUrl: z.string().nullable(),
  primaryColor: z.string().nullable(),
  secondaryColor: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const teamBodySchema = z.object({
  name: teamNameSchema,
  shortName: teamShortNameSchema.optional().nullable(),
  logoUrl: z.url().optional().nullable(),
  primaryColor: hexColorInputSchema.optional().nullable(),
  secondaryColor: hexColorInputSchema.optional().nullable(),
});

export const updateTeamBodySchema = teamBodySchema.partial();
