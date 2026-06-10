import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { championshipIdParamsSchema } from '../stages/stage.schema'
import { standingEntrySchema } from './standing.schema'

const getStandingsResponseSchema = z.object({
  data: z.array(standingEntrySchema),
})

export const getStandingsSchema = {
  tags: ['Standings'],
  summary: 'Consultar classificação por fase e grupo',
  operationId: 'getStandings',
  security: [{ bearerAuth: [] }],
  params: championshipIdParamsSchema,
  querystring: z.object({
    stageId: z.string().min(1),
    groupId: z.string().min(1),
  }),
  response: expandErrorResponses(
    { 200: getStandingsResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type GetStandingsParams = z.infer<typeof getStandingsSchema.params>
export type GetStandingsQuery = z.infer<typeof getStandingsSchema.querystring>
