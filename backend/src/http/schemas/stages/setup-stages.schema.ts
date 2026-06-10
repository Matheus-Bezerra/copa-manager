import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import {
  championshipIdParamsSchema,
  stageFormatSchema,
  stageTypeSchema,
  stageWithStructureSchema,
} from './stage.schema'

const setupGroupInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  teams: z.number().int().min(2).max(64),
})

const setupStageInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: stageTypeSchema,
  order: z.number().int().min(1),
  format: stageFormatSchema.optional(),
  teamsToAdvance: z.number().int().min(1).optional(),
  qualifiedTeams: z.number().int().min(2).optional(),
  thirdPlaceMatch: z.boolean().optional(),
  groups: z.array(setupGroupInputSchema).optional(),
})

const setupStagesResponseSchema = z.object({
  data: z.object({
    stages: z.array(stageWithStructureSchema),
  }),
})

export const setupStagesSchema = {
  tags: ['Stages'],
  summary: 'Setup em lote de fases (reset + recriação)',
  operationId: 'setupStages',
  security: [{ bearerAuth: [] }],
  params: championshipIdParamsSchema,
  body: z.object({
    stages: z.array(setupStageInputSchema).min(1),
  }),
  response: expandErrorResponses(
    { 200: setupStagesResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type SetupStagesParams = z.infer<typeof setupStagesSchema.params>
export type SetupStagesBody = z.infer<typeof setupStagesSchema.body>
