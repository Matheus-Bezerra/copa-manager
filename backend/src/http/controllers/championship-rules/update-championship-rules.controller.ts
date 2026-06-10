import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  ChampionshipRulesParams,
  UpdateChampionshipRulesBody,
} from '@/http/schemas/championship-rules/championship-rules.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { PrismaChampionshipRulesRepository } from '@/prisma/repositories/prisma-championship-rules-repository'
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service'
import { UpdateChampionshipRulesUseCase } from '@/use-cases/championship-rules/update-championship-rules'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function updateChampionshipRulesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { championshipId } = request.params as ChampionshipRulesParams
  const body = request.body as UpdateChampionshipRulesBody

  try {
    const { userId } = await request.verifyUserAvailability()

    await prismaChampionshipService().requireAccess(championshipId, userId, [
      'OWNER',
      'ADMINISTRATOR',
    ])

    const useCase = new UpdateChampionshipRulesUseCase(
      new PrismaChampionshipRepository(),
      new PrismaChampionshipRulesRepository(),
    )

    const { rules } = await useCase.execute({ championshipId, ...body })

    return reply.status(200).send({ data: { rules } })
  } catch (err) {
    logger.error('Update championship rules error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
