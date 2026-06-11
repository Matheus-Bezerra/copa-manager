import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ListMatchEventsParams } from '@/http/schemas/match-events/list-match-events.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaMatchEventRepository } from '@/prisma/repositories/prisma-match-event-repository'
import { PrismaMatchRepository } from '@/prisma/repositories/prisma-match-repository'
import { ListMatchEventsUseCase } from '@/use-cases/match-events/list-match-events'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function listMatchEventsController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, matchId } = request.params as ListMatchEventsParams

  try {
    await request.verifyUserAvailability()

    const useCase = new ListMatchEventsUseCase(
      new PrismaChampionshipRepository(),
      new PrismaMatchRepository(),
      new PrismaMatchEventRepository(),
    )

    const { events } = await useCase.execute({ championshipId, matchId })

    return reply.status(200).send({ data: { events } })
  } catch (err) {
    logger.error('List match events error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
