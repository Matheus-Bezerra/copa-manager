import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetMatchParams } from '@/http/schemas/matches/get-match.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaMatchRepository } from '@/prisma/repositories/prisma-match-repository'
import { PrismaMatchResultRepository } from '@/prisma/repositories/prisma-match-result-repository'
import { GetMatchUseCase } from '@/use-cases/matches/get-match'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function getMatchController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, matchId } = request.params as GetMatchParams

  try {
    await request.verifyUserAvailability()

    const useCase = new GetMatchUseCase(
      new PrismaChampionshipRepository(),
      new PrismaMatchRepository(),
      new PrismaMatchResultRepository(),
    )

    const { match, result } = await useCase.execute({ championshipId, matchId })

    return reply.status(200).send({ data: { match, result } })
  } catch (err) {
    logger.error('Get match error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
