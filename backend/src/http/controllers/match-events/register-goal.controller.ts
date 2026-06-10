import type { FastifyReply, FastifyRequest } from 'fastify'
import type { MatchEventParams, ScoringEventBody } from '@/http/schemas/match-events/match-event.schema'
import { PrismaMatchEventRepository } from '@/prisma/repositories/prisma-match-event-repository'
import { PrismaMatchRepository } from '@/prisma/repositories/prisma-match-repository'
import { PrismaPlayerRepository } from '@/prisma/repositories/prisma-player-repository'
import { PrismaPlayerStatisticsRepository } from '@/prisma/repositories/prisma-player-statistics-repository'
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service'
import { RegisterGoalUseCase } from '@/use-cases/match-events/register-goal'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function registerGoalController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, matchId } = request.params as MatchEventParams
  const { playerId, minute } = request.body as ScoringEventBody

  try {
    const { userId } = await request.verifyUserAvailability()

    await prismaChampionshipService().requireAccess(championshipId, userId, [
      'OWNER',
      'ADMINISTRATOR',
      'ORGANIZER',
    ])

    const useCase = new RegisterGoalUseCase(
      new PrismaMatchRepository(),
      new PrismaPlayerRepository(),
      new PrismaMatchEventRepository(),
      new PrismaPlayerStatisticsRepository(),
    )

    const { event } = await useCase.execute({ championshipId, matchId, playerId, minute })

    return reply.status(201).send({ data: { event } })
  } catch (err) {
    logger.error('Register goal error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
