import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ListAwardsParams } from '@/http/schemas/championships/award.schema'
import { PrismaAwardRepository } from '@/prisma/repositories/prisma-award-repository'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { ListAwardsUseCase } from '@/use-cases/championships/list-awards'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function listAwardsController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as ListAwardsParams

  try {
    await request.verifyUserAvailability()

    const useCase = new ListAwardsUseCase(
      new PrismaChampionshipRepository(),
      new PrismaAwardRepository(),
    )

    const { awards } = await useCase.execute({ championshipId })

    return reply.status(200).send({ data: awards })
  } catch (err) {
    logger.error('List awards error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
