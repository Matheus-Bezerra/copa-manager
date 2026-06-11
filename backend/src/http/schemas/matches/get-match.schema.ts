import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { matchResultSchema } from '../standings/standing.schema'
import { matchParamsSchema, matchSchema } from './match.schema'

const getMatchResponseSchema = z.object({
  data: z.object({
    match: matchSchema,
    result: matchResultSchema.nullable(),
  }),
})

export const getMatchSchema = {
  tags: ['Matches'],
  summary: 'Buscar partida por ID',
  operationId: 'getMatch',
  security: [{ bearerAuth: [] }],
  params: matchParamsSchema,
  response: expandErrorResponses(
    { 200: getMatchResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type GetMatchParams = z.infer<typeof getMatchSchema.params>
