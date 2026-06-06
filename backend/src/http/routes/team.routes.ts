import type { FastifyInstance } from 'fastify';
import { createTeamController } from '@/http/controllers/teams/create-team.controller';
import { deleteTeamController } from '@/http/controllers/teams/delete-team.controller';
import { listTeamsController } from '@/http/controllers/teams/list-teams.controller';
import { updateTeamController } from '@/http/controllers/teams/update-team.controller';
import { auth } from '@/http/middlewares/auth.middleware';
import { createTeamSchema } from '@/http/schemas/teams/create-team.schema';
import { deleteTeamSchema } from '@/http/schemas/teams/delete-team.schema';
import { listTeamsSchema } from '@/http/schemas/teams/list-teams.schema';
import { updateTeamSchema } from '@/http/schemas/teams/update-team.schema';

export async function teamRoutes(app: FastifyInstance) {
  await app.register(auth);

  app.post(
    '/championships/:championshipId/teams',
    { schema: createTeamSchema },
    createTeamController
  );
  app.get(
    '/championships/:championshipId/teams',
    { schema: listTeamsSchema },
    listTeamsController
  );
  app.put(
    '/championships/:championshipId/teams/:teamId',
    { schema: updateTeamSchema },
    updateTeamController
  );
  app.delete(
    '/championships/:championshipId/teams/:teamId',
    { schema: deleteTeamSchema },
    deleteTeamController
  );
}
