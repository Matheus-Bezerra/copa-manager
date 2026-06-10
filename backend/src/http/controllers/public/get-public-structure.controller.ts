import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetPublicStructureParams } from '@/http/schemas/public/public-competition.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaGroupRepository } from '@/prisma/repositories/prisma-group-repository'
import { PrismaRoundRepository } from '@/prisma/repositories/prisma-round-repository'
import { PrismaStageRepository } from '@/prisma/repositories/prisma-stage-repository'
import { GetPublicStructureUseCase } from '@/use-cases/public/get-public-structure'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function getPublicStructureController(request: FastifyRequest, reply: FastifyReply) {
  const { slug } = request.params as GetPublicStructureParams

  try {
    const useCase = new GetPublicStructureUseCase(
      new PrismaChampionshipRepository(),
      new PrismaStageRepository(),
      new PrismaGroupRepository(),
      new PrismaRoundRepository(),
    )

    const { stages } = await useCase.execute({ slug })

    return reply.status(200).send({ data: { stages } })
  } catch (err) {
    logger.error('Get public structure error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
