import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { championshipIdParamsSchema } from '../stages/stage.schema'

export const championshipRulesSchema = z.object({
  winPoints: z.number().int(),
  drawPoints: z.number().int(),
  penaltyBonusPoints: z.number().int(),
  yellowCardsForSuspension: z.number().int(),
  redCardSuspensionGames: z.number().int(),
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
})

export const tieBreakerRuleSchema = z.object({
  id: z.string().optional(),
  position: z.number().int(),
  criterion: z.string(),
})

const getChampionshipRulesResponseSchema = z.object({
  data: z.object({
    rules: championshipRulesSchema,
  }),
})

export const getChampionshipRulesSchema = {
  tags: ['Championship Rules'],
  summary: 'Consultar regras do campeonato',
  operationId: 'getChampionshipRules',
  security: [{ bearerAuth: [] }],
  params: championshipIdParamsSchema,
  response: expandErrorResponses(
    { 200: getChampionshipRulesResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

const updateChampionshipRulesResponseSchema = z.object({
  data: z.object({
    rules: championshipRulesSchema,
  }),
})

export const updateChampionshipRulesSchema = {
  tags: ['Championship Rules'],
  summary: 'Atualizar regras do campeonato',
  operationId: 'updateChampionshipRules',
  security: [{ bearerAuth: [] }],
  params: championshipIdParamsSchema,
  body: z.object({
    winPoints: z.number().int().min(0).optional(),
    drawPoints: z.number().int().min(0).optional(),
    penaltyBonusPoints: z.number().int().min(0).optional(),
    yellowCardsForSuspension: z.number().int().min(1).optional(),
    redCardSuspensionGames: z.number().int().min(0).optional(),
  }),
  response: expandErrorResponses(
    { 200: updateChampionshipRulesResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

const listTieBreakerRulesResponseSchema = z.object({
  data: z.object({
    rules: z.array(tieBreakerRuleSchema),
  }),
})

export const listTieBreakerRulesSchema = {
  tags: ['Championship Rules'],
  summary: 'Listar critérios de desempate do campeonato',
  operationId: 'listTieBreakerRules',
  security: [{ bearerAuth: [] }],
  params: championshipIdParamsSchema,
  response: expandErrorResponses(
    { 200: listTieBreakerRulesResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

const updateTieBreakerRulesResponseSchema = z.object({
  data: z.object({
    rules: z.array(tieBreakerRuleSchema),
  }),
})

export const updateTieBreakerRulesSchema = {
  tags: ['Championship Rules'],
  summary: 'Substituir critérios de desempate do campeonato',
  operationId: 'updateTieBreakerRules',
  security: [{ bearerAuth: [] }],
  params: championshipIdParamsSchema,
  body: z.object({
    rules: z
      .array(
        z.object({
          position: z.number().int().min(1),
          criterion: z.string().trim().min(1),
        }),
      )
      .min(1),
  }),
  response: expandErrorResponses(
    { 200: updateTieBreakerRulesResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type ChampionshipRulesParams = z.infer<typeof championshipIdParamsSchema>
export type UpdateChampionshipRulesBody = z.infer<typeof updateChampionshipRulesSchema.body>
export type UpdateTieBreakerRulesBody = z.infer<typeof updateTieBreakerRulesSchema.body>
