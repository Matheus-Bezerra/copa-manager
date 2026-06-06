import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { teamSchema, updateTeamBodySchema } from './team.schema';

const updateTeamResponseSchema = z.object({
  data: z.object({
    team: teamSchema,
  }),
});

export const updateTeamSchema = {
  tags: ['Teams'],
  summary: 'Atualizar equipe',
  operationId: 'updateTeam',
  security: [{ bearerAuth: [] }],
  params: z.object({
    championshipId: z.string().min(1),
    teamId: z.string().min(1),
  }),
  body: updateTeamBodySchema,
  response: expandErrorResponses(
    { 200: updateTeamResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type UpdateTeamParams = z.infer<typeof updateTeamSchema.params>;
export type UpdateTeamBody = z.infer<typeof updateTeamSchema.body>;
