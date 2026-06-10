import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { championshipIdParamsSchema, matchSchema, matchStatusSchema } from './match.schema'

const listMatchesResponseSchema = z.object({
  data: z.array(matchSchema),
})

export const listMatchesSchema = {
  tags: ['Matches'],
  summary: 'Listar partidas do campeonato',
  operationId: 'listMatches',
  security: [{ bearerAuth: [] }],
  params: championshipIdParamsSchema,
  querystring: z.object({
    roundId: z.string().min(1).optional(),
    groupId: z.string().min(1).optional(),
    status: matchStatusSchema.optional(),
  }),
  response: expandErrorResponses(
    { 200: listMatchesResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type ListMatchesParams = z.infer<typeof listMatchesSchema.params>
export type ListMatchesQuery = z.infer<typeof listMatchesSchema.querystring>
