import type { FastifyInstance } from 'fastify';
import { createPlayerController } from '@/http/controllers/players/create-player.controller';
import { deletePlayerController } from '@/http/controllers/players/delete-player.controller';
import { listPlayersController } from '@/http/controllers/players/list-players.controller';
import { updatePlayerController } from '@/http/controllers/players/update-player.controller';
import { auth } from '@/http/middlewares/auth.middleware';
import { createPlayerSchema } from '@/http/schemas/players/create-player.schema';
import { deletePlayerSchema } from '@/http/schemas/players/delete-player.schema';
import { listPlayersSchema } from '@/http/schemas/players/list-players.schema';
import { updatePlayerSchema } from '@/http/schemas/players/update-player.schema';

export async function playerRoutes(app: FastifyInstance) {
  await app.register(auth);

  app.post(
    '/championships/:championshipId/players',
    { schema: createPlayerSchema },
    createPlayerController
  );
  app.get(
    '/championships/:championshipId/players',
    { schema: listPlayersSchema },
    listPlayersController
  );
  app.put(
    '/championships/:championshipId/players/:playerId',
    { schema: updatePlayerSchema },
    updatePlayerController
  );
  app.delete(
    '/championships/:championshipId/players/:playerId',
    { schema: deletePlayerSchema },
    deletePlayerController
  );
}
