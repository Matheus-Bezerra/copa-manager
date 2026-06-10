import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { championshipIdStageIdParamsSchema, roundSchema } from '../stages/stage.schema'

const createRoundResponseSchema = z.object({
  data: z.object({
    round: roundSchema,
  }),
})

export const createRoundSchema = {
  tags: ['Rounds'],
  summary: 'Criar rodada em uma fase',
  operationId: 'createRound',
  security: [{ bearerAuth: [] }],
  params: championshipIdStageIdParamsSchema,
  body: z.object({
    name: z.string().trim().min(1).max(100).optional().nullable(),
  }),
  response: expandErrorResponses(
    { 201: createRoundResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type CreateRoundParams = z.infer<typeof createRoundSchema.params>
export type CreateRoundBody = z.infer<typeof createRoundSchema.body>
