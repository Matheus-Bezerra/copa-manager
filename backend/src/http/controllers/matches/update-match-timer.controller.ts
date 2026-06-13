import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  UpdateMatchTimerBody,
  UpdateMatchTimerParams,
} from '@/http/schemas/matches/update-match-timer.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaMatchRepository } from '@/prisma/repositories/prisma-match-repository'
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service'
import { UpdateMatchTimerUseCase } from '@/use-cases/matches/update-match-timer'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function updateMatchTimerController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, matchId } = request.params as UpdateMatchTimerParams
  const { action } = request.body as UpdateMatchTimerBody

  try {
    const { userId } = await request.verifyUserAvailability()

    await prismaChampionshipService().requireAccess(championshipId, userId, [
      'OWNER',
      'ADMINISTRATOR',
      'ORGANIZER',
    ])

    const useCase = new UpdateMatchTimerUseCase(
      new PrismaChampionshipRepository(),
      new PrismaMatchRepository(),
    )

    const { match } = await useCase.execute({ championshipId, matchId, action })

    return reply.status(200).send({ data: { match } })
  } catch (err) {
    logger.error('Update match timer error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
