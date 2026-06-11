import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ListPublicMatchEventsParams } from '@/http/schemas/public/list-public-match-events.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaMatchEventRepository } from '@/prisma/repositories/prisma-match-event-repository'
import { PrismaMatchRepository } from '@/prisma/repositories/prisma-match-repository'
import { ListPublicMatchEventsUseCase } from '@/use-cases/public/list-public-match-events'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function listPublicMatchEventsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { slug, matchId } = request.params as ListPublicMatchEventsParams

  try {
    const useCase = new ListPublicMatchEventsUseCase(
      new PrismaChampionshipRepository(),
      new PrismaMatchRepository(),
      new PrismaMatchEventRepository(),
    )

    const { events } = await useCase.execute({ slug, matchId })

    return reply.status(200).send({ data: { events } })
  } catch (err) {
    logger.error('List public match events error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
