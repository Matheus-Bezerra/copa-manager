import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetStandingsParams, GetStandingsQuery } from '@/http/schemas/standings/get-standings.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaGroupRepository } from '@/prisma/repositories/prisma-group-repository'
import { PrismaStageRepository } from '@/prisma/repositories/prisma-stage-repository'
import { PrismaStandingRepository } from '@/prisma/repositories/prisma-standing-repository'
import { GetStandingsUseCase } from '@/use-cases/standings/get-standings'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function getStandingsController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as GetStandingsParams
  const { stageId, groupId } = request.query as GetStandingsQuery

  try {
    await request.verifyUserAvailability()

    const useCase = new GetStandingsUseCase(
      new PrismaChampionshipRepository(),
      new PrismaStageRepository(),
      new PrismaGroupRepository(),
      new PrismaStandingRepository(),
    )

    const { standings } = await useCase.execute({ championshipId, stageId, groupId })

    return reply.status(200).send({ data: standings })
  } catch (err) {
    logger.error('Get standings error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
