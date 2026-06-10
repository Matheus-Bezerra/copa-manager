import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateStageBody, CreateStageParams } from '@/http/schemas/stages/create-stage.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaStageRepository } from '@/prisma/repositories/prisma-stage-repository'
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service'
import { CreateStageUseCase } from '@/use-cases/stages/create-stage'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function createStageController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as CreateStageParams
  const body = request.body as CreateStageBody

  try {
    const { userId } = await request.verifyUserAvailability()

    await prismaChampionshipService().requireAccess(championshipId, userId, ['OWNER', 'ADMINISTRATOR'])

    const useCase = new CreateStageUseCase(
      new PrismaChampionshipRepository(),
      new PrismaStageRepository(),
    )

    const { stage } = await useCase.execute({ championshipId, ...body })

    return reply.status(201).send({ data: { stage } })
  } catch (err) {
    logger.error('Create stage error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
