import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ListRoundsParams } from '@/http/schemas/rounds/list-rounds.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaRoundRepository } from '@/prisma/repositories/prisma-round-repository'
import { PrismaStageRepository } from '@/prisma/repositories/prisma-stage-repository'
import { ListRoundsUseCase } from '@/use-cases/rounds/list-rounds'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function listRoundsController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, stageId } = request.params as ListRoundsParams

  try {
    await request.verifyUserAvailability()

    const useCase = new ListRoundsUseCase(
      new PrismaChampionshipRepository(),
      new PrismaStageRepository(),
      new PrismaRoundRepository(),
    )

    const { rounds } = await useCase.execute({ championshipId, stageId })

    return reply.status(200).send({ data: rounds })
  } catch (err) {
    logger.error('List rounds error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
