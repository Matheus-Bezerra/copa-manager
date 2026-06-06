import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { memberSchema } from './member.schema';

const acceptInvitationResponseSchema = z.object({
  data: z.object({
    member: memberSchema,
  }),
});

export const acceptInvitationSchema = {
  tags: ['Championship Members'],
  summary: 'Aceitar convite',
  operationId: 'acceptInvitation',
  security: [{ bearerAuth: [] }],
  body: z.object({
    token: z.string().min(1),
  }),
  response: expandErrorResponses(
    { 200: acceptInvitationResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type AcceptInvitationBody = z.infer<typeof acceptInvitationSchema.body>;
