import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { teamSchema } from './team.schema';

const listTeamsResponseSchema = z.object({
  data: z.object({
    teams: z.array(teamSchema),
  }),
});

export const listTeamsSchema = {
  tags: ['Teams'],
  summary: 'Listar equipes',
  operationId: 'listTeams',
  security: [{ bearerAuth: [] }],
  params: z.object({
    championshipId: z.string().min(1),
  }),
  response: expandErrorResponses(
    { 200: listTeamsResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type ListTeamsParams = z.infer<typeof listTeamsSchema.params>;
