import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { matchParamsSchema, matchSchema } from './match.schema'

const updateMatchStatusResponseSchema = z.object({
  data: z.object({
    match: matchSchema,
  }),
})

export const updateMatchStatusSchema = {
  tags: ['Matches'],
  summary: 'Atualizar status da partida (iniciar ou cancelar)',
  operationId: 'updateMatchStatus',
  security: [{ bearerAuth: [] }],
  params: matchParamsSchema,
  body: z.object({
    status: z.enum(['IN_PROGRESS', 'CANCELLED']),
  }),
  response: expandErrorResponses(
    { 200: updateMatchStatusResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type UpdateMatchStatusParams = z.infer<typeof updateMatchStatusSchema.params>
export type UpdateMatchStatusBody = z.infer<typeof updateMatchStatusSchema.body>
