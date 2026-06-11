import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { matchSchema } from '../matches/match.schema'
import { matchResultSchema } from '../standings/standing.schema'

const getPublicMatchParamsSchema = z.object({
  slug: z.string().min(1),
  matchId: z.string().min(1),
})

export const getPublicMatchSchema = {
  tags: ['Public'],
  summary: 'Detalhe público de uma partida',
  operationId: 'getPublicMatch',
  params: getPublicMatchParamsSchema,
  response: expandErrorResponses(
    {
      200: z.object({
        data: z.object({
          match: matchSchema,
          result: matchResultSchema.nullable(),
        }),
      }),
    },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type GetPublicMatchParams = z.infer<typeof getPublicMatchSchema.params>
