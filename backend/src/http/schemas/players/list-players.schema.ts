import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { playerSchema } from './player.schema';

const listPlayersResponseSchema = z.object({
  data: z.object({
    players: z.array(playerSchema),
  }),
});

export const listPlayersSchema = {
  tags: ['Players'],
  summary: 'Listar jogadores',
  operationId: 'listPlayers',
  security: [{ bearerAuth: [] }],
  params: z.object({
    championshipId: z.string().min(1),
  }),
  response: expandErrorResponses(
    { 200: listPlayersResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type ListPlayersParams = z.infer<typeof listPlayersSchema.params>;
