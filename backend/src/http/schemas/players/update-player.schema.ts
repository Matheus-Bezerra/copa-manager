import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { playerSchema, updatePlayerBodySchema } from './player.schema';

const updatePlayerResponseSchema = z.object({
  data: z.object({
    player: playerSchema,
  }),
});

export const updatePlayerSchema = {
  tags: ['Players'],
  summary: 'Atualizar jogador',
  operationId: 'updatePlayer',
  security: [{ bearerAuth: [] }],
  params: z.object({
    championshipId: z.string().min(1),
    playerId: z.string().min(1),
  }),
  body: updatePlayerBodySchema,
  response: expandErrorResponses(
    { 200: updatePlayerResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type UpdatePlayerParams = z.infer<typeof updatePlayerSchema.params>;
export type UpdatePlayerBody = z.infer<typeof updatePlayerSchema.body>;
