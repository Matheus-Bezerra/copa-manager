import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { createPlayerBodySchema, playerSchema } from './player.schema';

const createPlayerResponseSchema = z.object({
  data: z.object({
    player: playerSchema,
  }),
});

export const createPlayerSchema = {
  tags: ['Players'],
  summary: 'Criar jogador',
  operationId: 'createPlayer',
  security: [{ bearerAuth: [] }],
  params: z.object({
    championshipId: z.string().min(1),
  }),
  body: createPlayerBodySchema,
  response: expandErrorResponses(
    { 201: createPlayerResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type CreatePlayerParams = z.infer<typeof createPlayerSchema.params>;
export type CreatePlayerBody = z.infer<typeof createPlayerSchema.body>;
