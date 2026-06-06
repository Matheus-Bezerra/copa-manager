import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { teamBodySchema, teamSchema } from './team.schema';

const createTeamResponseSchema = z.object({
  data: z.object({
    team: teamSchema,
  }),
});

export const createTeamSchema = {
  tags: ['Teams'],
  summary: 'Criar equipe',
  operationId: 'createTeam',
  security: [{ bearerAuth: [] }],
  params: z.object({
    championshipId: z.string().min(1),
  }),
  body: teamBodySchema,
  response: expandErrorResponses(
    { 201: createTeamResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type CreateTeamParams = z.infer<typeof createTeamSchema.params>;
export type CreateTeamBody = z.infer<typeof createTeamSchema.body>;
