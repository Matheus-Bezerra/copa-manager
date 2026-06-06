import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { championshipRoleSchema, invitationSchema } from './member.schema';

const inviteMemberResponseSchema = z.object({
  data: z.object({
    invitation: invitationSchema,
  }),
});

export const inviteMemberSchema = {
  tags: ['Championship Members'],
  summary: 'Convidar membro',
  operationId: 'inviteMember',
  security: [{ bearerAuth: [] }],
  params: z.object({
    championshipId: z.string().min(1),
  }),
  body: z.object({
    email: z.email(),
    role: championshipRoleSchema.exclude(['OWNER']),
  }),
  response: expandErrorResponses(
    { 201: inviteMemberResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type InviteMemberParams = z.infer<typeof inviteMemberSchema.params>;
export type InviteMemberBody = z.infer<typeof inviteMemberSchema.body>;
