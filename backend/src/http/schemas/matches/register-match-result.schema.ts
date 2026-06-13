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
  body: z
    .object({
      homeScore: z.number().int().min(0),
      awayScore: z.number().int().min(0),
      homePenaltyScore: z.number().int().min(0).optional().nullable(),
      awayPenaltyScore: z.number().int().min(0).optional().nullable(),
    })
    .superRefine((data, ctx) => {
      const isDraw = data.homeScore === data.awayScore
      const homePenaltyScore = data.homePenaltyScore ?? null
      const awayPenaltyScore = data.awayPenaltyScore ?? null

      if (!isDraw && (homePenaltyScore !== null || awayPenaltyScore !== null)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Penalty scores are only allowed when the match is tied after regular time',
          path: ['homePenaltyScore'],
        })
        return
      }

      const hasHomePenalty = homePenaltyScore !== null
      const hasAwayPenalty = awayPenaltyScore !== null

      if (isDraw && hasHomePenalty !== hasAwayPenalty) {
        if (!hasHomePenalty) {
          ctx.addIssue({
            code: 'custom',
            message: 'When penalty scores are provided, both teams must have a value',
            path: ['homePenaltyScore'],
          })
        }

        if (!hasAwayPenalty) {
          ctx.addIssue({
            code: 'custom',
            message: 'When penalty scores are provided, both teams must have a value',
            path: ['awayPenaltyScore'],
          })
        }
      }
    }),
  response: expandErrorResponses(
    { 200: registerMatchResultResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type RegisterMatchResultParams = z.infer<typeof registerMatchResultSchema.params>
export type RegisterMatchResultBody = z.infer<typeof registerMatchResultSchema.body>
