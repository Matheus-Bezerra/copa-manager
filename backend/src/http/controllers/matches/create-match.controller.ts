import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateMatchBody, CreateMatchParams } from '@/http/schemas/matches/create-match.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaGroupRepository } from '@/prisma/repositories/prisma-group-repository'
import { PrismaMatchRepository } from '@/prisma/repositories/prisma-match-repository'
import { PrismaRoundRepository } from '@/prisma/repositories/prisma-round-repository'
import { PrismaStageRepository } from '@/prisma/repositories/prisma-stage-repository'
import { PrismaTeamRepository } from '@/prisma/repositories/prisma-team-repository'
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service'
import { CreateMatchUseCase } from '@/use-cases/matches/create-match'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function createMatchController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as CreateMatchParams
  const body = request.body as CreateMatchBody

  try {
    const { userId } = await request.verifyUserAvailability()

    await prismaChampionshipService().requireAccess(championshipId, userId, [
      'OWNER',
      'ADMINISTRATOR',
      'ORGANIZER',
    ])

    const useCase = new CreateMatchUseCase(
      new PrismaChampionshipRepository(),
      new PrismaRoundRepository(),
      new PrismaStageRepository(),
      new PrismaGroupRepository(),
      new PrismaTeamRepository(),
      new PrismaMatchRepository(),
    )

    const { match } = await useCase.execute({ championshipId, ...body })

    return reply.status(201).send({ data: { match } })
  } catch (err) {
    logger.error('Create match error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
