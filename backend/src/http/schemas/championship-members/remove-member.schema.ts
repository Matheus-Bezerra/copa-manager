import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';

export const removeMemberSchema = {
  tags: ['Championship Members'],
  summary: 'Remover membro',
  operationId: 'removeMember',
  security: [{ bearerAuth: [] }],
  params: z.object({
    championshipId: z.string().min(1),
    memberId: z.string().min(1),
  }),
  response: expandErrorResponses({ 204: z.null() }, { '4xx': errorSchema, '5xx': errorSchema }),
};

export type RemoveMemberParams = z.infer<typeof removeMemberSchema.params>;
