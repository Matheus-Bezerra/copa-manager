import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';

export const forgotPasswordSchema = {
  tags: ['Auth'],
  summary: 'Solicitar redefinição de senha',
  operationId: 'forgotPassword',
  body: z.object({
    email: z.email(),
  }),
  response: expandErrorResponses(
    { 204: z.null().describe('Código de redefinição enviado com sucesso') },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema.body>;
