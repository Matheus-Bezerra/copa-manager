import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { matchEventParamsSchema, matchEventSchema } from './match-event.schema'

const listMatchEventsResponseSchema = z.object({
  data: z.object({
    events: z.array(matchEventSchema),
  }),
})

export const listMatchEventsSchema = {
  tags: ['Match Events'],
  summary: 'Listar eventos da partida',
  operationId: 'listMatchEvents',
  security: [{ bearerAuth: [] }],
  params: matchEventParamsSchema,
  response: expandErrorResponses(
    { 200: listMatchEventsResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type ListMatchEventsParams = z.infer<typeof matchEventParamsSchema>
