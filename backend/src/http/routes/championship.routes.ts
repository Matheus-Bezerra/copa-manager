import type { FastifyInstance } from 'fastify';
import { createChampionshipController } from '@/http/controllers/championships/create-championship.controller';
import { deleteChampionshipController } from '@/http/controllers/championships/delete-championship.controller';
import { getChampionshipController } from '@/http/controllers/championships/get-championship.controller';
import { listChampionshipsController } from '@/http/controllers/championships/list-championships.controller';
import { updateChampionshipController } from '@/http/controllers/championships/update-championship.controller';
import { auth } from '@/http/middlewares/auth.middleware';
import { createChampionshipSchema } from '@/http/schemas/championships/create-championship.schema';
import { deleteChampionshipSchema } from '@/http/schemas/championships/delete-championship.schema';
import { getChampionshipSchema } from '@/http/schemas/championships/get-championship.schema';
import { listChampionshipsSchema } from '@/http/schemas/championships/list-championships.schema';
import { updateChampionshipSchema } from '@/http/schemas/championships/update-championship.schema';

export async function championshipRoutes(app: FastifyInstance) {
  await app.register(auth);

  app.post('/championships', { schema: createChampionshipSchema }, createChampionshipController);
  app.get('/championships', { schema: listChampionshipsSchema }, listChampionshipsController);
  app.get(
    '/championships/:championshipId',
    { schema: getChampionshipSchema },
    getChampionshipController
  );
  app.put(
    '/championships/:championshipId',
    { schema: updateChampionshipSchema },
    updateChampionshipController
  );
  app.delete(
    '/championships/:championshipId',
    { schema: deleteChampionshipSchema },
    deleteChampionshipController
  );
}
