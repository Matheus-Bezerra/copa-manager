import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  UpdateMatchStatusBody,
  UpdateMatchStatusParams,
} from '@/http/schemas/matches/update-match-status.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaMatchRepository } from '@/prisma/repositories/prisma-match-repository'
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service'
import { UpdateMatchStatusUseCase } from '@/use-cases/matches/update-match-status'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function updateMatchStatusController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, matchId } = request.params as UpdateMatchStatusParams
  const { status } = request.body as UpdateMatchStatusBody

  try {
    const { userId } = await request.verifyUserAvailability()

    await prismaChampionshipService().requireAccess(championshipId, userId, [
      'OWNER',
      'ADMINISTRATOR',
      'ORGANIZER',
    ])

    const useCase = new UpdateMatchStatusUseCase(
      new PrismaChampionshipRepository(),
      new PrismaMatchRepository(),
    )

    const { match } = await useCase.execute({ championshipId, matchId, status })

    return reply.status(200).send({ data: { match } })
  } catch (err) {
    logger.error('Update match status error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
