import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { championshipIdParamsSchema, matchSchema } from './match.schema'

const createMatchResponseSchema = z.object({
  data: z.object({
    match: matchSchema,
  }),
})

export const createMatchSchema = {
  tags: ['Matches'],
  summary: 'Criar partida',
  operationId: 'createMatch',
  security: [{ bearerAuth: [] }],
  params: championshipIdParamsSchema,
  body: z.object({
    roundId: z.string().min(1),
    groupId: z.string().min(1).optional().nullable(),
    homeTeamId: z.string().min(1).optional().nullable(),
    awayTeamId: z.string().min(1).optional().nullable(),
    scheduledAt: z.coerce.date().optional().nullable(),
  }),
  response: expandErrorResponses(
    { 201: createMatchResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type CreateMatchParams = z.infer<typeof createMatchSchema.params>
export type CreateMatchBody = z.infer<typeof createMatchSchema.body>
