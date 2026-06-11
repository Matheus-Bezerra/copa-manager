import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ListMatchesParams, ListMatchesQuery } from '@/http/schemas/matches/list-matches.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaMatchEventRepository } from '@/prisma/repositories/prisma-match-event-repository'
import { PrismaMatchRepository } from '@/prisma/repositories/prisma-match-repository'
import { PrismaMatchResultRepository } from '@/prisma/repositories/prisma-match-result-repository'
import { ListMatchesUseCase } from '@/use-cases/matches/list-matches'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function listMatchesController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as ListMatchesParams
  const { roundId, groupId, status } = request.query as ListMatchesQuery

  try {
    await request.verifyUserAvailability()

    const useCase = new ListMatchesUseCase(
      new PrismaChampionshipRepository(),
      new PrismaMatchRepository(),
      new PrismaMatchResultRepository(),
      new PrismaMatchEventRepository(),
    )

    const { matches } = await useCase.execute({
      championshipId,
      filters: { roundId, groupId, status },
    })

    return reply.status(200).send({ data: matches })
  } catch (err) {
    logger.error('List matches error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
