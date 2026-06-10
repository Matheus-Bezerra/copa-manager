import type { FastifyInstance } from 'fastify'
import { createGroupController } from '@/http/controllers/groups/create-group.controller'
import { listGroupsController } from '@/http/controllers/groups/list-groups.controller'
import { createRoundController } from '@/http/controllers/rounds/create-round.controller'
import { listRoundsController } from '@/http/controllers/rounds/list-rounds.controller'
import { createStageController } from '@/http/controllers/stages/create-stage.controller'
import { getChampionshipStructureController } from '@/http/controllers/stages/get-championship-structure.controller'
import { listStagesController } from '@/http/controllers/stages/list-stages.controller'
import { setupStagesController } from '@/http/controllers/stages/setup-stages.controller'
import { auth } from '@/http/middlewares/auth.middleware'
import { createGroupSchema } from '@/http/schemas/groups/create-group.schema'
import { listGroupsSchema } from '@/http/schemas/groups/list-groups.schema'
import { createRoundSchema } from '@/http/schemas/rounds/create-round.schema'
import { listRoundsSchema } from '@/http/schemas/rounds/list-rounds.schema'
import { createStageSchema } from '@/http/schemas/stages/create-stage.schema'
import { getChampionshipStructureSchema } from '@/http/schemas/stages/get-championship-structure.schema'
import { listStagesSchema } from '@/http/schemas/stages/list-stages.schema'
import { setupStagesSchema } from '@/http/schemas/stages/setup-stages.schema'

export async function stageRoutes(app: FastifyInstance) {
  await app.register(auth)

  app.post(
    '/championships/:championshipId/stages/setup',
    { schema: setupStagesSchema },
    setupStagesController,
  )

  app.post(
    '/championships/:championshipId/stages',
    { schema: createStageSchema },
    createStageController,
  )

  app.get(
    '/championships/:championshipId/stages',
    { schema: listStagesSchema },
    listStagesController,
  )

  app.get(
    '/championships/:championshipId/structure',
    { schema: getChampionshipStructureSchema },
    getChampionshipStructureController,
  )

  app.post(
    '/championships/:championshipId/stages/:stageId/groups',
    { schema: createGroupSchema },
    createGroupController,
  )

  app.get(
    '/championships/:championshipId/stages/:stageId/groups',
    { schema: listGroupsSchema },
    listGroupsController,
  )

  app.post(
    '/championships/:championshipId/stages/:stageId/rounds',
    { schema: createRoundSchema },
    createRoundController,
  )

  app.get(
    '/championships/:championshipId/stages/:stageId/rounds',
    { schema: listRoundsSchema },
    listRoundsController,
  )
}
