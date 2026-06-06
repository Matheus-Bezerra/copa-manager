import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';

export const logoutSchema = {
  tags: ['Auth'],
  summary: 'Encerrar sessão',
  operationId: 'logout',
  body: z.object({
    refreshToken: z.string().min(1),
  }),
  response: expandErrorResponses(
    { 204: z.null().describe('Sessão encerrada com sucesso') },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type LogoutBody = z.infer<typeof logoutSchema.body>;
