import { z } from '@/lib/zod';

export const healthSchema = {
  tags: ['Health'],
  summary: 'Health check',
  operationId: 'health',
  response: {
    200: z.object({
      status: z.literal('ok'),
    }),
  },
};
