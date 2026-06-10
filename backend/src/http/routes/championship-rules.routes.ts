import type { FastifyInstance } from 'fastify'
import { getChampionshipRulesController } from '@/http/controllers/championship-rules/get-championship-rules.controller'
import { listTieBreakerRulesController } from '@/http/controllers/championship-rules/list-tie-breaker-rules.controller'
import { updateChampionshipRulesController } from '@/http/controllers/championship-rules/update-championship-rules.controller'
import { updateTieBreakerRulesController } from '@/http/controllers/championship-rules/update-tie-breaker-rules.controller'
import { auth } from '@/http/middlewares/auth.middleware'
import {
  getChampionshipRulesSchema,
  listTieBreakerRulesSchema,
  updateChampionshipRulesSchema,
  updateTieBreakerRulesSchema,
} from '@/http/schemas/championship-rules/championship-rules.schema'

export async function championshipRulesRoutes(app: FastifyInstance) {
  await app.register(auth)

  app.get(
    '/championships/:championshipId/rules',
    { schema: getChampionshipRulesSchema },
    getChampionshipRulesController,
  )

  app.put(
    '/championships/:championshipId/rules',
    { schema: updateChampionshipRulesSchema },
    updateChampionshipRulesController,
  )

  app.get(
    '/championships/:championshipId/rules/tie-breakers',
    { schema: listTieBreakerRulesSchema },
    listTieBreakerRulesController,
  )

  app.put(
    '/championships/:championshipId/rules/tie-breakers',
    { schema: updateTieBreakerRulesSchema },
    updateTieBreakerRulesController,
  )
}
