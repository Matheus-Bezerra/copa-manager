import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { memberSchema } from './member.schema';

const listMembersResponseSchema = z.object({
  data: z.object({
    members: z.array(memberSchema),
  }),
});

export const listMembersSchema = {
  tags: ['Championship Members'],
  summary: 'Listar membros',
  operationId: 'listMembers',
  security: [{ bearerAuth: [] }],
  params: z.object({
    championshipId: z.string().min(1),
  }),
  response: expandErrorResponses(
    { 200: listMembersResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type ListMembersParams = z.infer<typeof listMembersSchema.params>;
