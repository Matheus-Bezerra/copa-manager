import type { FastifyInstance } from 'fastify'
import { createMatchController } from '@/http/controllers/matches/create-match.controller'
import { getMatchController } from '@/http/controllers/matches/get-match.controller'
import { listMatchesController } from '@/http/controllers/matches/list-matches.controller'
import { updateMatchController } from '@/http/controllers/matches/update-match.controller'
import { updateMatchStatusController } from '@/http/controllers/matches/update-match-status.controller'
import { registerMatchResultController } from '@/http/controllers/matches/register-match-result.controller'
import { auth } from '@/http/middlewares/auth.middleware'
import { createMatchSchema } from '@/http/schemas/matches/create-match.schema'
import { getMatchSchema } from '@/http/schemas/matches/get-match.schema'
import { listMatchesSchema } from '@/http/schemas/matches/list-matches.schema'
import { registerMatchResultSchema } from '@/http/schemas/matches/register-match-result.schema'
import { updateMatchSchema } from '@/http/schemas/matches/update-match.schema'
import { updateMatchStatusSchema } from '@/http/schemas/matches/update-match-status.schema'

export async function matchRoutes(app: FastifyInstance) {
  await app.register(auth)

  app.post(
    '/championships/:championshipId/matches',
    { schema: createMatchSchema },
    createMatchController,
  )

  app.get(
    '/championships/:championshipId/matches',
    { schema: listMatchesSchema },
    listMatchesController,
  )

  app.get(
    '/championships/:championshipId/matches/:matchId',
    { schema: getMatchSchema },
    getMatchController,
  )

  app.put(
    '/championships/:championshipId/matches/:matchId',
    { schema: updateMatchSchema },
    updateMatchController,
  )

  app.patch(
    '/championships/:championshipId/matches/:matchId/status',
    { schema: updateMatchStatusSchema },
    updateMatchStatusController,
  )

  app.post(
    '/championships/:championshipId/matches/:matchId/result',
    { schema: registerMatchResultSchema },
    registerMatchResultController,
  )
}
