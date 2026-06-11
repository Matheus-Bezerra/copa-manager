import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { championshipIdParamsSchema } from '../stages/stage.schema'

export const awardTypeSchema = z.enum([
  'TOP_SCORER',
  'MATCH_MVP',
  'TOURNAMENT_MVP',
  'FAIR_PLAY',
])

export const awardSchema = z.object({
  id: z.string(),
  championshipId: z.string(),
  playerId: z.string(),
  matchId: z.string().nullable(),
  awardType: awardTypeSchema,
  createdAt: z.coerce.date(),
})

export const listAwardsSchema = {
  tags: ['Awards'],
  summary: 'Listar premiações do campeonato',
  operationId: 'listAwards',
  security: [{ bearerAuth: [] }],
  params: championshipIdParamsSchema,
  response: expandErrorResponses(
    { 200: z.object({ data: z.array(awardSchema) }) },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export const grantAwardSchema = {
  tags: ['Awards'],
  summary: 'Conceder premiação a jogador',
  operationId: 'grantAward',
  security: [{ bearerAuth: [] }],
  params: championshipIdParamsSchema,
  body: z.object({
    playerId: z.string().min(1),
    type: awardTypeSchema,
  }),
  response: expandErrorResponses(
    { 201: z.object({ data: z.object({ award: awardSchema }) }) },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type ListAwardsParams = z.infer<typeof listAwardsSchema.params>
export type GrantAwardParams = z.infer<typeof grantAwardSchema.params>
export type GrantAwardBody = z.infer<typeof grantAwardSchema.body>
