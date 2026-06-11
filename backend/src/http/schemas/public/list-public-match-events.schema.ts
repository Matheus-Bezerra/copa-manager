import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { matchEventSchema } from '../match-events/match-event.schema'

const listPublicMatchEventsParamsSchema = z.object({
  slug: z.string().min(1),
  matchId: z.string().min(1),
})

export const listPublicMatchEventsSchema = {
  tags: ['Public'],
  summary: 'Eventos públicos de uma partida',
  operationId: 'listPublicMatchEvents',
  params: listPublicMatchEventsParamsSchema,
  response: expandErrorResponses(
    {
      200: z.object({
        data: z.object({
          events: z.array(matchEventSchema),
        }),
      }),
    },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type ListPublicMatchEventsParams = z.infer<typeof listPublicMatchEventsSchema.params>
