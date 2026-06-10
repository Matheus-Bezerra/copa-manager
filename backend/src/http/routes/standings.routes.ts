import type { FastifyInstance } from 'fastify'
import { getStandingsController } from '@/http/controllers/standings/get-standings.controller'
import { auth } from '@/http/middlewares/auth.middleware'
import { getStandingsSchema } from '@/http/schemas/standings/get-standings.schema'

export async function standingsRoutes(app: FastifyInstance) {
  await app.register(auth)

  app.get(
    '/championships/:championshipId/standings',
    { schema: getStandingsSchema },
    getStandingsController,
  )
}
