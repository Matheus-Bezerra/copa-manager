import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'

export const matchEventTypeSchema = z.enum(['GOAL', 'YELLOW_CARD', 'RED_CARD', 'MVP'])

export const matchEventSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  playerId: z.string().nullable(),
  teamId: z.string().nullable(),
  eventType: matchEventTypeSchema,
  minute: z.number().int().nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export const matchEventParamsSchema = z.object({
  championshipId: z.string().min(1),
  matchId: z.string().min(1),
})

export const scoringEventBodySchema = z.object({
  playerId: z.string().min(1),
  minute: z.number().int().min(0).max(200).optional().nullable(),
})

export const goalEventBodySchema = z
  .object({
    playerId: z.string().min(1).optional(),
    teamId: z.string().min(1).optional(),
    minute: z.number().int().min(0).max(200).optional().nullable(),
  })
  .refine((data) => Boolean(data.playerId || data.teamId), {
    message: 'Informe o jogador ou o time',
  })

export const defineMatchMvpBodySchema = z.object({
  playerId: z.string().min(1),
})

const matchEventResponseSchema = z.object({
  data: z.object({
    event: matchEventSchema,
  }),
})

const scoringEventResponses = expandErrorResponses(
  { 201: matchEventResponseSchema },
  { '4xx': errorSchema, '5xx': errorSchema },
)

export const registerGoalSchema = {
  tags: ['Match Events'],
  summary: 'Registrar gol',
  description:
    'A partida deve estar IN_PROGRESS ou FINISHED. Incrementa goals em PlayerStatistics.',
  operationId: 'registerGoal',
  security: [{ bearerAuth: [] }],
  params: matchEventParamsSchema,
  body: goalEventBodySchema,
  response: scoringEventResponses,
}

export const registerYellowCardSchema = {
  tags: ['Match Events'],
  summary: 'Registrar cartão amarelo',
  description:
    'A partida deve estar IN_PROGRESS ou FINISHED. Incrementa yellowCards em PlayerStatistics.',
  operationId: 'registerYellowCard',
  security: [{ bearerAuth: [] }],
  params: matchEventParamsSchema,
  body: scoringEventBodySchema,
  response: scoringEventResponses,
}

export const registerRedCardSchema = {
  tags: ['Match Events'],
  summary: 'Registrar cartão vermelho',
  description:
    'A partida deve estar IN_PROGRESS ou FINISHED. Incrementa redCards em PlayerStatistics.',
  operationId: 'registerRedCard',
  security: [{ bearerAuth: [] }],
  params: matchEventParamsSchema,
  body: scoringEventBodySchema,
  response: scoringEventResponses,
}

export const defineMatchMvpSchema = {
  tags: ['Match Events'],
  summary: 'Definir MVP da partida',
  description:
    'A partida deve estar FINISHED. Se já existir MVP, substitui e ajusta matchMvps em PlayerStatistics.',
  operationId: 'defineMatchMvp',
  security: [{ bearerAuth: [] }],
  params: matchEventParamsSchema,
  body: defineMatchMvpBodySchema,
  response: expandErrorResponses(
    { 201: matchEventResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type MatchEventParams = z.infer<typeof matchEventParamsSchema>
export type ScoringEventBody = z.infer<typeof scoringEventBodySchema>
export type GoalEventBody = z.infer<typeof goalEventBodySchema>
export type DefineMatchMvpBody = z.infer<typeof defineMatchMvpBodySchema>
