import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { publicPlayerSchema } from '../players/player.schema';

const listPublicPlayersResponseSchema = z.object({
  data: z.object({
    players: z.array(publicPlayerSchema),
  }),
});

export const listPublicPlayersSchema = {
  tags: ['Public'],
  summary: 'Listar jogadores públicos',
  operationId: 'listPublicPlayers',
  params: z.object({
    slug: z.string().min(1),
  }),
  response: expandErrorResponses(
    { 200: listPublicPlayersResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type ListPublicPlayersParams = z.infer<typeof listPublicPlayersSchema.params>;
