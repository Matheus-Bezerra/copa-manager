import type { FastifyReply, FastifyRequest } from 'fastify'
import type { UpdateMatchBody, UpdateMatchParams } from '@/http/schemas/matches/update-match.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaMatchRepository } from '@/prisma/repositories/prisma-match-repository'
import { PrismaTeamRepository } from '@/prisma/repositories/prisma-team-repository'
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service'
import { UpdateMatchUseCase } from '@/use-cases/matches/update-match'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function updateMatchController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, matchId } = request.params as UpdateMatchParams
  const body = request.body as UpdateMatchBody

  try {
    const { userId } = await request.verifyUserAvailability()

    await prismaChampionshipService().requireAccess(championshipId, userId, [
      'OWNER',
      'ADMINISTRATOR',
      'ORGANIZER',
    ])

    const useCase = new UpdateMatchUseCase(
      new PrismaChampionshipRepository(),
      new PrismaTeamRepository(),
      new PrismaMatchRepository(),
    )

    const { match } = await useCase.execute({ championshipId, matchId, ...body })

    return reply.status(200).send({ data: { match } })
  } catch (err) {
    logger.error('Update match error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
