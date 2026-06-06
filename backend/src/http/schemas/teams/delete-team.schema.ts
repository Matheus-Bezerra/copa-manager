import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';

export const deleteTeamSchema = {
  tags: ['Teams'],
  summary: 'Excluir equipe',
  operationId: 'deleteTeam',
  security: [{ bearerAuth: [] }],
  params: z.object({
    championshipId: z.string().min(1),
    teamId: z.string().min(1),
  }),
  response: expandErrorResponses({ 204: z.null() }, { '4xx': errorSchema, '5xx': errorSchema }),
};

export type DeleteTeamParams = z.infer<typeof deleteTeamSchema.params>;
