import type { FastifyReply, FastifyRequest } from 'fastify';
import type { GetPublicChampionshipParams } from '@/http/schemas/public/get-public-championship.schema';
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository';
import { GetPublicChampionshipUseCase } from '@/use-cases/public/get-public-championship';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function getPublicChampionshipController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { slug } = request.params as GetPublicChampionshipParams;

  try {
    const getPublicChampionshipUseCase = new GetPublicChampionshipUseCase(
      new PrismaChampionshipRepository()
    );

    const { championship } = await getPublicChampionshipUseCase.execute({ slug });

    return reply.status(200).send({ data: { championship } });
  } catch (err) {
    logger.error('Get public championship error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
