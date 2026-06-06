import type { FastifyReply, FastifyRequest } from 'fastify';
import type { CreateChampionshipBody } from '@/http/schemas/championships/create-championship.schema';
import { PrismaChampionshipMemberRepository } from '@/prisma/repositories/prisma-championship-member-repository';
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository';
import { CreateChampionshipUseCase } from '@/use-cases/championships/create-championship';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function createChampionshipController(request: FastifyRequest, reply: FastifyReply) {
  const { name, description, startDate, endDate } = request.body as CreateChampionshipBody;

  try {
    const { userId } = await request.verifyUserAvailability();

    const createChampionshipUseCase = new CreateChampionshipUseCase(
      new PrismaChampionshipRepository(),
      new PrismaChampionshipMemberRepository()
    );

    const { championship } = await createChampionshipUseCase.execute({
      userId,
      name,
      description,
      startDate,
      endDate,
    });

    return reply.status(201).send({ data: { championship } });
  } catch (err) {
    logger.error('Create championship error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
