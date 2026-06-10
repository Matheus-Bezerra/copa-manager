import { z } from '@/lib/zod'

export const stageTypeSchema = z.enum(['GROUP_STAGE', 'KNOCKOUT'])
export const stageFormatSchema = z.enum(['ROUND_ROBIN', 'DOUBLE_ROUND_ROBIN'])

export const stageSchema = z.object({
  id: z.string(),
  championshipId: z.string(),
  name: z.string(),
  type: stageTypeSchema,
  format: stageFormatSchema.nullable(),
  teamsToAdvance: z.number().int(),
  qualifiedTeams: z.number().int().nullable(),
  thirdPlaceMatch: z.boolean(),
  displayOrder: z.number().int(),
  createdAt: z.coerce.date(),
})

export const groupSchema = z.object({
  id: z.string(),
  stageId: z.string(),
  name: z.string(),
  displayOrder: z.number().int(),
  createdAt: z.coerce.date(),
})

export const roundSchema = z.object({
  id: z.string(),
  stageId: z.string(),
  number: z.number().int(),
  name: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export const stageWithStructureSchema = stageSchema.extend({
  groups: z.array(groupSchema),
  rounds: z.array(roundSchema),
})

export const championshipIdStageIdParamsSchema = z.object({
  championshipId: z.string().min(1),
  stageId: z.string().min(1),
})

export const championshipIdParamsSchema = z.object({
  championshipId: z.string().min(1),
})
