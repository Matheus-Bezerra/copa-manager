import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { passwordSchema } from './password.schema';

export const resetPasswordSchema = {
  tags: ['Auth'],
  summary: 'Redefinir senha',
  operationId: 'resetPassword',
  body: z.object({
    code: z.string().min(1),
    newPassword: passwordSchema,
  }),
  response: expandErrorResponses(
    { 204: z.null().describe('Senha redefinida com sucesso') },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type ResetPasswordBody = z.infer<typeof resetPasswordSchema.body>;
