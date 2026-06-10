import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetChampionshipStructureParams } from '@/http/schemas/stages/get-championship-structure.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaGroupRepository } from '@/prisma/repositories/prisma-group-repository'
import { PrismaRoundRepository } from '@/prisma/repositories/prisma-round-repository'
import { PrismaStageRepository } from '@/prisma/repositories/prisma-stage-repository'
import { GetChampionshipStructureUseCase } from '@/use-cases/stages/get-championship-structure'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function getChampionshipStructureController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as GetChampionshipStructureParams

  try {
    await request.verifyUserAvailability()

    const useCase = new GetChampionshipStructureUseCase(
      new PrismaChampionshipRepository(),
      new PrismaStageRepository(),
      new PrismaGroupRepository(),
      new PrismaRoundRepository(),
    )

    const { stages } = await useCase.execute({ championshipId })

    return reply.status(200).send({ data: { stages } })
  } catch (err) {
    logger.error('Get championship structure error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
