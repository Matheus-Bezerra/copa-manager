import type { FastifyInstance } from 'fastify';
import { getPublicChampionshipController } from '@/http/controllers/public/get-public-championship.controller';
import { getPublicMatchController } from '@/http/controllers/public/get-public-match.controller';
import { listPublicMatchEventsController } from '@/http/controllers/public/list-public-match-events.controller';
import { listPublicPlayersController } from '@/http/controllers/public/list-public-players.controller';
import { listPublicTeamsController } from '@/http/controllers/public/list-public-teams.controller';
import { getPublicStructureController } from '@/http/controllers/public/get-public-structure.controller';
import { getPublicStandingsController } from '@/http/controllers/public/get-public-standings.controller';
import { listPublicMatchesController } from '@/http/controllers/public/list-public-matches.controller';
import { getPublicChampionshipSchema } from '@/http/schemas/public/get-public-championship.schema';
import { getPublicMatchSchema } from '@/http/schemas/public/get-public-match.schema';
import { listPublicMatchEventsSchema } from '@/http/schemas/public/list-public-match-events.schema';
import { listPublicPlayersSchema } from '@/http/schemas/public/list-public-players.schema';
import { listPublicTeamsSchema } from '@/http/schemas/public/list-public-teams.schema';
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
    '/public/championships/:slug/teams',
    { schema: listPublicTeamsSchema },
    listPublicTeamsController
  );
  app.get(
    '/public/championships/:slug/matches/:matchId',
    { schema: getPublicMatchSchema },
    getPublicMatchController
  );
  app.get(
    '/public/championships/:slug/matches/:matchId/events',
    { schema: listPublicMatchEventsSchema },
    listPublicMatchEventsController
  );
  app.get(
    '/public/championships/:slug/matches',
    { schema: listPublicMatchesSchema },
    listPublicMatchesController
  );
}
