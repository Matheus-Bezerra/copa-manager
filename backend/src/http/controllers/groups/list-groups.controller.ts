import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ListGroupsParams } from '@/http/schemas/groups/list-groups.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaGroupRepository } from '@/prisma/repositories/prisma-group-repository'
import { PrismaStageRepository } from '@/prisma/repositories/prisma-stage-repository'
import { ListGroupsUseCase } from '@/use-cases/groups/list-groups'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function listGroupsController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, stageId } = request.params as ListGroupsParams

  try {
    await request.verifyUserAvailability()

    const useCase = new ListGroupsUseCase(
      new PrismaChampionshipRepository(),
      new PrismaStageRepository(),
      new PrismaGroupRepository(),
    )

    const { groups } = await useCase.execute({ championshipId, stageId })

    return reply.status(200).send({ data: groups })
  } catch (err) {
    logger.error('List groups error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
