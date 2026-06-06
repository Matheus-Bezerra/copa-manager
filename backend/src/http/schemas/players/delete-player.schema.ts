import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';

export const deletePlayerSchema = {
  tags: ['Players'],
  summary: 'Excluir jogador',
  operationId: 'deletePlayer',
  security: [{ bearerAuth: [] }],
  params: z.object({
    championshipId: z.string().min(1),
    playerId: z.string().min(1),
  }),
  response: expandErrorResponses({ 204: z.null() }, { '4xx': errorSchema, '5xx': errorSchema }),
};

export type DeletePlayerParams = z.infer<typeof deletePlayerSchema.params>;
