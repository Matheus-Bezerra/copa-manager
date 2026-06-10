import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  RegisterMatchResultBody,
  RegisterMatchResultParams,
} from '@/http/schemas/matches/register-match-result.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaChampionshipRulesRepository } from '@/prisma/repositories/prisma-championship-rules-repository'
import { PrismaGroupRepository } from '@/prisma/repositories/prisma-group-repository'
import { PrismaMatchRepository } from '@/prisma/repositories/prisma-match-repository'
import { PrismaMatchResultRepository } from '@/prisma/repositories/prisma-match-result-repository'
import { PrismaMatchBracketLinkRepository } from '@/prisma/repositories/prisma-match-bracket-link-repository'
import { PrismaRoundRepository } from '@/prisma/repositories/prisma-round-repository'
import { PrismaStageRepository } from '@/prisma/repositories/prisma-stage-repository'
import { PrismaStandingRepository } from '@/prisma/repositories/prisma-standing-repository'
import { PrismaTieBreakerRuleRepository } from '@/prisma/repositories/prisma-tie-breaker-rule-repository'
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service'
import { RegisterMatchResultUseCase } from '@/use-cases/matches/register-match-result'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function registerMatchResultController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId, matchId } = request.params as RegisterMatchResultParams
  const body = request.body as RegisterMatchResultBody

  try {
    const { userId } = await request.verifyUserAvailability()

    await prismaChampionshipService().requireAccess(championshipId, userId, [
      'OWNER',
      'ADMINISTRATOR',
      'ORGANIZER',
    ])

    const useCase = new RegisterMatchResultUseCase(
      new PrismaChampionshipRepository(),
      new PrismaMatchRepository(),
      new PrismaMatchResultRepository(),
      new PrismaRoundRepository(),
      new PrismaStageRepository(),
      new PrismaGroupRepository(),
      new PrismaStandingRepository(),
      new PrismaChampionshipRulesRepository(),
      new PrismaTieBreakerRuleRepository(),
      new PrismaMatchBracketLinkRepository(),
    )

    const { match, result } = await useCase.execute({
      championshipId,
      matchId,
      ...body,
    })

    return reply.status(200).send({ data: { match, result } })
  } catch (err) {
    logger.error('Register match result error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
