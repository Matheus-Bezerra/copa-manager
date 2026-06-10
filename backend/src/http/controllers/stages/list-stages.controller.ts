import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ListStagesParams } from '@/http/schemas/stages/list-stages.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaStageRepository } from '@/prisma/repositories/prisma-stage-repository'
import { ListStagesUseCase } from '@/use-cases/stages/list-stages'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function listStagesController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as ListStagesParams

  try {
    await request.verifyUserAvailability()

    const useCase = new ListStagesUseCase(
      new PrismaChampionshipRepository(),
      new PrismaStageRepository(),
    )

    const { stages } = await useCase.execute({ championshipId })

    return reply.status(200).send({ data: stages })
  } catch (err) {
    logger.error('List stages error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
