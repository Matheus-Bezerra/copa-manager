import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { matchParamsSchema, matchSchema } from './match.schema'

const updateMatchResponseSchema = z.object({
  data: z.object({
    match: matchSchema,
  }),
})

export const updateMatchSchema = {
  tags: ['Matches'],
  summary: 'Atualizar partida (times, data/hora)',
  operationId: 'updateMatch',
  security: [{ bearerAuth: [] }],
  params: matchParamsSchema,
  body: z.object({
    homeTeamId: z.string().min(1).optional().nullable(),
    awayTeamId: z.string().min(1).optional().nullable(),
    scheduledAt: z.coerce.date().optional().nullable(),
  }),
  response: expandErrorResponses(
    { 200: updateMatchResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type UpdateMatchParams = z.infer<typeof updateMatchSchema.params>
export type UpdateMatchBody = z.infer<typeof updateMatchSchema.body>
