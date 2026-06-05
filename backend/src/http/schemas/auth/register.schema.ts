import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { validateLowercase } from '@/utils/validators/validate-lowercase';
import { validateNumeric } from '@/utils/validators/validate-numeric';
import { validateSpecialChar } from '@/utils/validators/validate-special-char';
import { validateUppercase } from '@/utils/validators/validate-uppercase';
import { errorSchema } from '../common.schema';

const publicUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  avatarUrl: z.string().nullable(),
});

const registerResponseSchema = z.object({
  data: z.object({
    user: publicUserSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
});

export const registerSchema = {
  tags: ['Auth'],
  summary: 'Registrar usuário',
  operationId: 'register',
  body: z.object({
    name: z.string().trim().min(3),
    email: z.email(),
    password: z
      .string()
      .min(6, { error: 'A senha deve ter no mínimo 6 caracteres' })
      .refine(validateUppercase, {
        error: 'A senha deve conter ao menos uma letra maiúscula',
      })
      .refine(validateLowercase, {
        error: 'A senha deve conter ao menos uma letra minúscula',
      })
      .refine(validateNumeric, {
        error: 'A senha deve conter ao menos um número',
      })
      .refine(validateSpecialChar, {
        error: 'A senha deve conter ao menos um símbolo',
      }),
  }),
  response: expandErrorResponses(
    { 201: registerResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type RegisterBody = z.infer<typeof registerSchema.body>;
