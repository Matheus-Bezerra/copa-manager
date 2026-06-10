import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GrantAwardBody, GrantAwardParams } from '@/http/schemas/championships/award.schema'
import { PrismaAwardRepository } from '@/prisma/repositories/prisma-award-repository'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaPlayerRepository } from '@/prisma/repositories/prisma-player-repository'
import { PrismaTeamRepository } from '@/prisma/repositories/prisma-team-repository'
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service'
import { GrantAwardUseCase } from '@/use-cases/championships/grant-award'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function grantAwardController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as GrantAwardParams
  const { playerId, type } = request.body as GrantAwardBody

  try {
    const { userId } = await request.verifyUserAvailability()

    await prismaChampionshipService().requireAccess(championshipId, userId, [
      'OWNER',
      'ADMINISTRATOR',
    ])

    const useCase = new GrantAwardUseCase(
      new PrismaChampionshipRepository(),
      new PrismaTeamRepository(),
      new PrismaPlayerRepository(),
      new PrismaAwardRepository(),
    )

    const { award } = await useCase.execute({ championshipId, playerId, awardType: type })

    return reply.status(201).send({ data: { award } })
  } catch (err) {
    logger.error('Grant award error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
