import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  GetPublicStandingsParams,
  GetPublicStandingsQuery,
} from '@/http/schemas/public/public-competition.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaGroupRepository } from '@/prisma/repositories/prisma-group-repository'
import { PrismaStageRepository } from '@/prisma/repositories/prisma-stage-repository'
import { PrismaStandingRepository } from '@/prisma/repositories/prisma-standing-repository'
import { GetPublicStandingsUseCase } from '@/use-cases/public/get-public-standings'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function getPublicStandingsController(request: FastifyRequest, reply: FastifyReply) {
  const { slug } = request.params as GetPublicStandingsParams
  const { stageId, groupId } = request.query as GetPublicStandingsQuery

  try {
    const useCase = new GetPublicStandingsUseCase(
      new PrismaChampionshipRepository(),
      new PrismaStageRepository(),
      new PrismaGroupRepository(),
      new PrismaStandingRepository(),
    )

    const { standings } = await useCase.execute({ slug, stageId, groupId })

    return reply.status(200).send({ data: standings })
  } catch (err) {
    logger.error('Get public standings error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
