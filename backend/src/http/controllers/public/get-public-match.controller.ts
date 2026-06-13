import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetPublicMatchParams } from '@/http/schemas/public/get-public-match.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaChampionshipRulesRepository } from '@/prisma/repositories/prisma-championship-rules-repository'
import { PrismaMatchRepository } from '@/prisma/repositories/prisma-match-repository'
import { PrismaMatchResultRepository } from '@/prisma/repositories/prisma-match-result-repository'
import { GetPublicMatchUseCase } from '@/use-cases/public/get-public-match'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function getPublicMatchController(request: FastifyRequest, reply: FastifyReply) {
  const { slug, matchId } = request.params as GetPublicMatchParams

  try {
    const useCase = new GetPublicMatchUseCase(
      new PrismaChampionshipRepository(),
      new PrismaMatchRepository(),
      new PrismaMatchResultRepository(),
      new PrismaChampionshipRulesRepository(),
    )

    const { match, result, matchDuration } = await useCase.execute({ slug, matchId })

    return reply.status(200).send({ data: { match, result, matchDuration } })
  } catch (err) {
    logger.error('Get public match error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
