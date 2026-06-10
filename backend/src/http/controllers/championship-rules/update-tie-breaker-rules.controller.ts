import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  ChampionshipRulesParams,
  UpdateTieBreakerRulesBody,
} from '@/http/schemas/championship-rules/championship-rules.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaTieBreakerRuleRepository } from '@/prisma/repositories/prisma-tie-breaker-rule-repository'
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service'
import { UpdateTieBreakerRulesUseCase } from '@/use-cases/championship-rules/update-tie-breaker-rules'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function updateTieBreakerRulesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { championshipId } = request.params as ChampionshipRulesParams
  const { rules } = request.body as UpdateTieBreakerRulesBody

  try {
    const { userId } = await request.verifyUserAvailability()

    await prismaChampionshipService().requireAccess(championshipId, userId, [
      'OWNER',
      'ADMINISTRATOR',
    ])

    const useCase = new UpdateTieBreakerRulesUseCase(
      new PrismaChampionshipRepository(),
      new PrismaTieBreakerRuleRepository(),
    )

    const result = await useCase.execute({ championshipId, rules })

    return reply.status(200).send({ data: { rules: result.rules } })
  } catch (err) {
    logger.error('Update tie breaker rules error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
