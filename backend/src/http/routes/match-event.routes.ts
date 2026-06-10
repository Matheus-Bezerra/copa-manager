import type { FastifyInstance } from 'fastify'
import { defineMatchMvpController } from '@/http/controllers/match-events/define-match-mvp.controller'
import { registerGoalController } from '@/http/controllers/match-events/register-goal.controller'
import { registerRedCardController } from '@/http/controllers/match-events/register-red-card.controller'
import { registerYellowCardController } from '@/http/controllers/match-events/register-yellow-card.controller'
import { auth } from '@/http/middlewares/auth.middleware'
import {
  defineMatchMvpSchema,
  registerGoalSchema,
  registerRedCardSchema,
  registerYellowCardSchema,
} from '@/http/schemas/match-events/match-event.schema'

export async function matchEventRoutes(app: FastifyInstance) {
  await app.register(auth)

  app.post(
    '/championships/:championshipId/matches/:matchId/events/goal',
    { schema: registerGoalSchema },
    registerGoalController,
  )

  app.post(
    '/championships/:championshipId/matches/:matchId/events/yellow-card',
    { schema: registerYellowCardSchema },
    registerYellowCardController,
  )

  app.post(
    '/championships/:championshipId/matches/:matchId/events/red-card',
    { schema: registerRedCardSchema },
    registerRedCardController,
  )

  app.post(
    '/championships/:championshipId/matches/:matchId/mvp',
    { schema: defineMatchMvpSchema },
    defineMatchMvpController,
  )
}
