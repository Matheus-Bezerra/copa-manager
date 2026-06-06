import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { championshipRoleSchema, memberSchema } from './member.schema';

const updateMemberRoleResponseSchema = z.object({
  data: z.object({
    member: memberSchema.omit({ user: true }),
  }),
});

export const updateMemberRoleSchema = {
  tags: ['Championship Members'],
  summary: 'Atualizar papel do membro',
  operationId: 'updateMemberRole',
  security: [{ bearerAuth: [] }],
  params: z.object({
    championshipId: z.string().min(1),
    memberId: z.string().min(1),
  }),
  body: z.object({
    role: championshipRoleSchema.exclude(['OWNER']),
  }),
  response: expandErrorResponses(
    { 200: updateMemberRoleResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type UpdateMemberRoleParams = z.infer<typeof updateMemberRoleSchema.params>;
export type UpdateMemberRoleBody = z.infer<typeof updateMemberRoleSchema.body>;
