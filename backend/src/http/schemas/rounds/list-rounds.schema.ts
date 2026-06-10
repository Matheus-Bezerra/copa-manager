import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { championshipIdStageIdParamsSchema, roundSchema } from '../stages/stage.schema'

const listRoundsResponseSchema = z.object({
  data: z.array(roundSchema),
})

export const listRoundsSchema = {
  tags: ['Rounds'],
  summary: 'Listar rodadas de uma fase',
  operationId: 'listRounds',
  security: [{ bearerAuth: [] }],
  params: championshipIdStageIdParamsSchema,
  response: expandErrorResponses(
    { 200: listRoundsResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type ListRoundsParams = z.infer<typeof listRoundsSchema.params>
