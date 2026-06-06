import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { passwordSchema } from './password.schema';

export const changePasswordSchema = {
  tags: ['Auth'],
  summary: 'Alterar senha',
  operationId: 'changePassword',
  security: [{ bearerAuth: [] }],
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
  }),
  response: expandErrorResponses(
    { 204: z.null().describe('Senha alterada com sucesso') },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type ChangePasswordBody = z.infer<typeof changePasswordSchema.body>;
