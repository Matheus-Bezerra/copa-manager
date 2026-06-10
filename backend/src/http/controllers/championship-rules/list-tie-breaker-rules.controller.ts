import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ChampionshipRulesParams } from '@/http/schemas/championship-rules/championship-rules.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaTieBreakerRuleRepository } from '@/prisma/repositories/prisma-tie-breaker-rule-repository'
import { ListTieBreakerRulesUseCase } from '@/use-cases/championship-rules/list-tie-breaker-rules'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function listTieBreakerRulesController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as ChampionshipRulesParams

  try {
    await request.verifyUserAvailability()

    const useCase = new ListTieBreakerRulesUseCase(
      new PrismaChampionshipRepository(),
      new PrismaTieBreakerRuleRepository(),
    )

    const { rules } = await useCase.execute({ championshipId })

    return reply.status(200).send({ data: { rules } })
  } catch (err) {
    logger.error('List tie breaker rules error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
