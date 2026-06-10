import type { FastifyInstance } from 'fastify';
import { getPublicChampionshipController } from '@/http/controllers/public/get-public-championship.controller';
import { listPublicPlayersController } from '@/http/controllers/public/list-public-players.controller';
import { getPublicStructureController } from '@/http/controllers/public/get-public-structure.controller';
import { getPublicStandingsController } from '@/http/controllers/public/get-public-standings.controller';
import { listPublicMatchesController } from '@/http/controllers/public/list-public-matches.controller';
import { getPublicChampionshipSchema } from '@/http/schemas/public/get-public-championship.schema';
import { listPublicPlayersSchema } from '@/http/schemas/public/list-public-players.schema';
import { getPublicStructureSchema, getPublicStandingsSchema, listPublicMatchesSchema } from '@/http/schemas/public/public-competition.schema';

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
  app.get(
    '/public/championships/:slug/structure',
    { schema: getPublicStructureSchema },
    getPublicStructureController
  );
  app.get(
    '/public/championships/:slug/standings',
    { schema: getPublicStandingsSchema },
    getPublicStandingsController
  );
  app.get(
    '/public/championships/:slug/matches',
    { schema: listPublicMatchesSchema },
    listPublicMatchesController
  );
}
