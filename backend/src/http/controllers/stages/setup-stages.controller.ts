import type { FastifyReply, FastifyRequest } from 'fastify'
import type { SetupStagesBody, SetupStagesParams } from '@/http/schemas/stages/setup-stages.schema'
import { PrismaCompetitionSetupRepository } from '@/prisma/repositories/prisma-competition-setup-repository'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { prismaChampionshipService } from '@/services/championship/prisma-championship-access-service'
import { SetupStagesUseCase } from '@/use-cases/stages/setup-stages'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function setupStagesController(request: FastifyRequest, reply: FastifyReply) {
  const { championshipId } = request.params as SetupStagesParams
  const { stages } = request.body as SetupStagesBody

  try {
    const { userId } = await request.verifyUserAvailability()

    await prismaChampionshipService().requireAccess(championshipId, userId, ['OWNER', 'ADMINISTRATOR'])

    const useCase = new SetupStagesUseCase(
      new PrismaChampionshipRepository(),
      new PrismaCompetitionSetupRepository(),
    )

    const { stages: result } = await useCase.execute({ championshipId, stages })

    return reply.status(200).send({ data: { stages: result } })
  } catch (err) {
    logger.error('Setup stages error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
