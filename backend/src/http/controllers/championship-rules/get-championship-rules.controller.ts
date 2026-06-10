import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ChampionshipRulesParams } from '@/http/schemas/championship-rules/championship-rules.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaChampionshipRulesRepository } from '@/prisma/repositories/prisma-championship-rules-repository'
import { GetChampionshipRulesUseCase } from '@/use-cases/championship-rules/get-championship-rules'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function getChampionshipRulesController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as ChampionshipRulesParams

  try {
    await request.verifyUserAvailability()

    const useCase = new GetChampionshipRulesUseCase(
      new PrismaChampionshipRepository(),
      new PrismaChampionshipRulesRepository(),
    )

    const { rules } = await useCase.execute({ championshipId })

    return reply.status(200).send({ data: { rules } })
  } catch (err) {
    logger.error('Get championship rules error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
