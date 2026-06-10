import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateRoundBody, CreateRoundParams } from '@/http/schemas/rounds/create-round.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaRoundRepository } from '@/prisma/repositories/prisma-round-repository'
import { PrismaStageRepository } from '@/prisma/repositories/prisma-stage-repository'
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service'
import { CreateRoundUseCase } from '@/use-cases/rounds/create-round'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function createRoundController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, stageId } = request.params as CreateRoundParams
  const { name } = request.body as CreateRoundBody

  try {
    const { userId } = await request.verifyUserAvailability()

    await prismaChampionshipService().requireAccess(championshipId, userId, ['OWNER', 'ADMINISTRATOR'])

    const useCase = new CreateRoundUseCase(
      new PrismaChampionshipRepository(),
      new PrismaStageRepository(),
      new PrismaRoundRepository(),
    )

    const { round } = await useCase.execute({ championshipId, stageId, name })

    return reply.status(201).send({ data: { round } })
  } catch (err) {
    logger.error('Create round error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
