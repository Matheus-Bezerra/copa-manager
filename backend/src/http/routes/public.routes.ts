import type { FastifyInstance } from 'fastify';
import { getPublicChampionshipController } from '@/http/controllers/public/get-public-championship.controller';
import { listPublicPlayersController } from '@/http/controllers/public/list-public-players.controller';
import { getPublicChampionshipSchema } from '@/http/schemas/public/get-public-championship.schema';
import { listPublicPlayersSchema } from '@/http/schemas/public/list-public-players.schema';

export async function publicRoutes(app: FastifyInstance) {
  app.get(
    '/public/championships/:slug',
    { schema: getPublicChampionshipSchema },
    getPublicChampionshipController
  );
  app.get(
    '/public/championships/:slug/players',
    { schema: listPublicPlayersSchema },
    listPublicPlayersController
  );
}
