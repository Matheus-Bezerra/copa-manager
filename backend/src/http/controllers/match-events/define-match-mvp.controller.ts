import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  DefineMatchMvpBody,
  MatchEventParams,
} from '@/http/schemas/match-events/match-event.schema'
import { PrismaMatchEventRepository } from '@/prisma/repositories/prisma-match-event-repository'
import { PrismaMatchRepository } from '@/prisma/repositories/prisma-match-repository'
import { PrismaPlayerRepository } from '@/prisma/repositories/prisma-player-repository'
import { PrismaPlayerStatisticsRepository } from '@/prisma/repositories/prisma-player-statistics-repository'
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service'
import { DefineMatchMvpUseCase } from '@/use-cases/match-events/define-match-mvp'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function defineMatchMvpController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, matchId } = request.params as MatchEventParams
  const { playerId } = request.body as DefineMatchMvpBody

  try {
    const { userId } = await request.verifyUserAvailability()

    await prismaChampionshipService().requireAccess(championshipId, userId, [
      'OWNER',
      'ADMINISTRATOR',
      'ORGANIZER',
    ])

    const useCase = new DefineMatchMvpUseCase(
      new PrismaMatchRepository(),
      new PrismaPlayerRepository(),
      new PrismaMatchEventRepository(),
      new PrismaPlayerStatisticsRepository(),
    )

    const { event } = await useCase.execute({ championshipId, matchId, playerId })

    return reply.status(201).send({ data: { event } })
  } catch (err) {
    logger.error('Define match MVP error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
