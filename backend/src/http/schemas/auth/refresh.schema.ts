import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';

const refreshResponseSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
});

export const refreshSchema = {
  tags: ['Auth'],
  summary: 'Renovar sessão',
  operationId: 'refreshSession',
  body: z.object({
    refreshToken: z.string().min(1),
  }),
  response: expandErrorResponses(
    { 200: refreshResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type RefreshBody = z.infer<typeof refreshSchema.body>;
