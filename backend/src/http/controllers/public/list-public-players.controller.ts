import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ListPublicPlayersParams } from '@/http/schemas/public/list-public-players.schema';
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository';
import { PrismaPlayerRepository } from '@/prisma/repositories/prisma-player-repository';
import { ListPublicPlayersUseCase } from '@/use-cases/public/list-public-players';
import { formatError } from '@/utils/errors/format-error';
import { logger } from '@/utils/logger';

export async function listPublicPlayersController(request: FastifyRequest, reply: FastifyReply) {
  const { slug } = request.params as ListPublicPlayersParams;

  try {
    const listPublicPlayersUseCase = new ListPublicPlayersUseCase(
      new PrismaChampionshipRepository(),
      new PrismaPlayerRepository()
    );

    const { players } = await listPublicPlayersUseCase.execute({ slug });

    return reply.status(200).send({ data: { players } });
  } catch (err) {
    logger.error('List public players error', err);
    const { statusCode, code, message } = formatError(err);

    return reply.status(statusCode).send({ code, message });
  }
}
