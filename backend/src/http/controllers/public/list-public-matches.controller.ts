import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  ListPublicMatchesParams,
  ListPublicMatchesQuery,
} from '@/http/schemas/public/public-competition.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaMatchEventRepository } from '@/prisma/repositories/prisma-match-event-repository'
import { PrismaMatchRepository } from '@/prisma/repositories/prisma-match-repository'
import { PrismaMatchResultRepository } from '@/prisma/repositories/prisma-match-result-repository'
import { ListPublicMatchesUseCase } from '@/use-cases/public/list-public-matches'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function listPublicMatchesController(request: FastifyRequest, reply: FastifyReply) {
  const { slug } = request.params as ListPublicMatchesParams
  const { roundId, groupId, status } = request.query as ListPublicMatchesQuery

  try {
    const useCase = new ListPublicMatchesUseCase(
      new PrismaChampionshipRepository(),
      new PrismaMatchRepository(),
      new PrismaMatchResultRepository(),
      new PrismaMatchEventRepository(),
    )

    const { matches } = await useCase.execute({ slug, filters: { roundId, groupId, status } })

    return reply.status(200).send({ data: matches })
  } catch (err) {
    logger.error('List public matches error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
