import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { championshipIdParamsSchema, stageSchema } from './stage.schema'

const listStagesResponseSchema = z.object({
  data: z.array(stageSchema),
})

export const listStagesSchema = {
  tags: ['Stages'],
  summary: 'Listar fases do campeonato',
  operationId: 'listStages',
  security: [{ bearerAuth: [] }],
  params: championshipIdParamsSchema,
  response: expandErrorResponses(
    { 200: listStagesResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type ListStagesParams = z.infer<typeof listStagesSchema.params>
