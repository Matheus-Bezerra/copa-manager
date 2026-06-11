import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ListPublicTeamsParams } from '@/http/schemas/public/list-public-teams.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaTeamRepository } from '@/prisma/repositories/prisma-team-repository'
import { ListPublicTeamsUseCase } from '@/use-cases/public/list-public-teams'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function listPublicTeamsController(request: FastifyRequest, reply: FastifyReply) {
  const { slug } = request.params as ListPublicTeamsParams

  try {
    const useCase = new ListPublicTeamsUseCase(
      new PrismaChampionshipRepository(),
      new PrismaTeamRepository(),
    )

    const { teams } = await useCase.execute({ slug })

    return reply.status(200).send({ data: { teams } })
  } catch (err) {
    logger.error('List public teams error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
