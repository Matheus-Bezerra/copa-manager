import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { matchParamsSchema } from '../matches/match.schema'
import { matchResultSchema } from '../standings/standing.schema'
import { matchSchema } from '../matches/match.schema'

const registerMatchResultResponseSchema = z.object({
  data: z.object({
    match: matchSchema,
    result: matchResultSchema,
  }),
})

export const registerMatchResultSchema = {
  tags: ['Matches'],
  summary: 'Registrar ou atualizar resultado da partida',
  operationId: 'registerMatchResult',
  security: [{ bearerAuth: [] }],
  params: matchParamsSchema,
  body: z.object({
    homeScore: z.number().int().min(0),
    awayScore: z.number().int().min(0),
    homePenaltyScore: z.number().int().min(0).optional().nullable(),
    awayPenaltyScore: z.number().int().min(0).optional().nullable(),
  }),
  response: expandErrorResponses(
    { 200: registerMatchResultResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type RegisterMatchResultParams = z.infer<typeof registerMatchResultSchema.params>
export type RegisterMatchResultBody = z.infer<typeof registerMatchResultSchema.body>
