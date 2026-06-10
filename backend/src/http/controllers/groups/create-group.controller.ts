import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateGroupBody, CreateGroupParams } from '@/http/schemas/groups/create-group.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaGroupRepository } from '@/prisma/repositories/prisma-group-repository'
import { PrismaStageRepository } from '@/prisma/repositories/prisma-stage-repository'
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service'
import { CreateGroupUseCase } from '@/use-cases/groups/create-group'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function createGroupController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, stageId } = request.params as CreateGroupParams
  const { name } = request.body as CreateGroupBody

  try {
    const { userId } = await request.verifyUserAvailability()

    await prismaChampionshipService().requireAccess(championshipId, userId, ['OWNER', 'ADMINISTRATOR'])

    const useCase = new CreateGroupUseCase(
      new PrismaChampionshipRepository(),
      new PrismaStageRepository(),
      new PrismaGroupRepository(),
    )

    const { group } = await useCase.execute({ championshipId, stageId, name })

    return reply.status(201).send({ data: { group } })
  } catch (err) {
    logger.error('Create group error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
