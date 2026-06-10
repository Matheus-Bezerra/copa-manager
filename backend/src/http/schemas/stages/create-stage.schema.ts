import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import {
  championshipIdParamsSchema,
  stageFormatSchema,
  stageSchema,
  stageTypeSchema,
} from './stage.schema'

const createStageResponseSchema = z.object({
  data: z.object({
    stage: stageSchema,
  }),
})

export const createStageSchema = {
  tags: ['Stages'],
  summary: 'Criar fase individualmente',
  operationId: 'createStage',
  security: [{ bearerAuth: [] }],
  params: championshipIdParamsSchema,
  body: z.object({
    name: z.string().trim().min(1).max(100),
    type: stageTypeSchema,
    format: stageFormatSchema.optional(),
    teamsToAdvance: z.number().int().min(1).optional(),
    qualifiedTeams: z.number().int().min(2).optional().nullable(),
    thirdPlaceMatch: z.boolean().optional(),
  }),
  response: expandErrorResponses(
    { 201: createStageResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type CreateStageParams = z.infer<typeof createStageSchema.params>
export type CreateStageBody = z.infer<typeof createStageSchema.body>
