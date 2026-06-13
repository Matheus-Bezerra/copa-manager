import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { matchParamsSchema, matchSchema } from './match.schema'

const updateMatchTimerResponseSchema = z.object({
  data: z.object({
    match: matchSchema,
  }),
})

export const updateMatchTimerSchema = {
  tags: ['Matches'],
  summary: 'Pausar ou retomar o timer da partida',
  operationId: 'updateMatchTimer',
  security: [{ bearerAuth: [] }],
  params: matchParamsSchema,
  body: z.object({
    action: z.enum(['PAUSE', 'RESUME']),
  }),
  response: expandErrorResponses(
    { 200: updateMatchTimerResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type UpdateMatchTimerParams = z.infer<typeof updateMatchTimerSchema.params>
export type UpdateMatchTimerBody = z.infer<typeof updateMatchTimerSchema.body>
